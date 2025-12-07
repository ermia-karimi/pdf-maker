// app.js — Snap2Pdf Ultra-Fast + Lossless-Like + Fit + Chunked
let pickedImages = [];
let pdfSize = "a4";

// ---------- CONFIG ----------
const DEFAULT_MAX_DIM = 1500;
const DEFAULT_QUALITY = 1;          // full quality, no degradation
const CHUNK_SIZE = 20;
const MIN_TICK = 0;                 // no artificial slowdown

// ---------- DOM refs ----------
const inputEl = document.getElementById("imagePicker");
const toastEl = document.getElementById("toast");
const convertBtn = document.getElementById("convertBtn");
const hh11 = document.getElementById("hh11");
const sizeButtons = document.getElementById("sizeButtons");

// ---------- Toast ----------
function showToast(msg = "", duration = 1800) {
    if (!toastEl) return;
    toastEl.innerText = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("show"), duration);
}
function setStatus(text = "") {
    if (!hh11) return;
    hh11.innerText = text;
}

// ---------- File select ----------
inputEl.addEventListener("change", async (e) => {
    pickedImages = Array.from(e.target.files || []);
    setStatus("");
    showToast(`Selected ${pickedImages.length} photos`);
    await new Promise(r => setTimeout(r, 40));
});

// ---------- Size buttons ----------
sizeButtons.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".size-btn");
    if (!btn) return;
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    pdfSize = btn.dataset.size || "a4";
});

// ---------- Super-Fast Image Pipeline ----------
async function fileToBitmap(file) {
    return await createImageBitmap(file, { premultiplyAlpha: "none" });
}

const reuseCanvas = document.createElement("canvas");
const reuseCtx = reuseCanvas.getContext("2d");

function bitmapToJPEGDataURL(bitmap, maxDim, quality) {
    const ratio = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);

    reuseCanvas.width = w;
    reuseCanvas.height = h;

    reuseCtx.drawImage(bitmap, 0, 0, w, h);

    return new Promise(res => {
        reuseCanvas.toBlob(b => {
            const r = new FileReader();
            r.onloadend = () => res(r.result);
            r.readAsDataURL(b);
        }, "image/jpeg", quality);
    });
}

async function processImageFile(file, maxDim, quality) {
    const bitmap = await fileToBitmap(file);
    return await bitmapToJPEGDataURL(bitmap, maxDim, quality);
}

// ---------- Fit page size ----------
const FIT_MAX_DIM = 2500;
function calcFitPageSize(imgW, imgH, uiMax) {
    const maxDim = Math.max(imgW, imgH);
    const cap = Math.min(FIT_MAX_DIM, uiMax || DEFAULT_MAX_DIM);
    if (maxDim <= cap) return [imgW, imgH];
    const scale = cap / maxDim;
    return [Math.round(imgW * scale), Math.round(imgH * scale)];
}

// ---------- Main PDF creation ----------
convertBtn.addEventListener("click", async () => {
    try {
        if (!pickedImages.length) {
            showToast("Please select photos first", 2000);
            return;
        }

        const maxDimInput = document.getElementById("maxDim");
        const qualityInput = document.getElementById("quality");

        const uiMax =
            maxDimInput ? Math.max(600, Math.min(4000, Number(maxDimInput.value) || DEFAULT_MAX_DIM)) :
                DEFAULT_MAX_DIM;

        const uiQuality = 1; // locked for no-quality-loss

        setStatus("");
        showToast("Preparing PDF...");

        const { jsPDF } = window.jspdf;
        let pdf;
        let pageW, pageH;

        // FIT MODE FIRST PAGE
        if (pdfSize === "fit") {
            setStatus("Processing first image...");
            const firstCompressed = await processImageFile(pickedImages[0], uiMax, uiQuality);
            const firstImg = await createImageBitmap(await (await fetch(firstCompressed)).blob());

            [pageW, pageH] = calcFitPageSize(firstImg.width, firstImg.height, uiMax);

            pdf = new jsPDF({
                unit: "px",
                format: [pageW, pageH],
                compress: true,
                worker: true
            });

            const scale = Math.min(pageW / firstImg.width, pageH / firstImg.height, 1);
            const w = Math.round(firstImg.width * scale);
            const h = Math.round(firstImg.height * scale);
            const x = Math.round((pageW - w) / 2);
            const y = Math.round((pageH - h) / 2);

            pdf.addImage(firstCompressed, "JPEG", x, y, w, h, undefined, "FAST");
        } else {
            pdf = new jsPDF({ unit: "px", format: pdfSize, compress: true, worker: true });
            pageW = pdf.internal.pageSize.getWidth();
            pageH = pdf.internal.pageSize.getHeight();
        }

        const total = pickedImages.length;
        let processed = (pdfSize === "fit") ? 1 : 0;
        const startIndex = processed;

        // CHUNK LOOP
        for (let s = startIndex; s < total; s += CHUNK_SIZE) {
            const chunk = pickedImages.slice(s, s + CHUNK_SIZE);

            for (let i = 0; i < chunk.length; i++) {
                const idx = s + i;
                setStatus(`Processing ${idx + 1} / ${total}`);

                try {
                    const compressed = await processImageFile(chunk[i], uiMax, uiQuality);

                    const blob = await (await fetch(compressed)).blob();
                    const img = await createImageBitmap(blob);

                    const maxW = pageW - 20;
                    const maxH = pageH - 20;

                    const scale = Math.min(maxW / img.width, maxH / img.height, 1);
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);
                    const x = Math.round((pageW - w) / 2);
                    const y = Math.round((pageH - h) / 2);

                    pdf.addPage(); // simplified
                    pdf.addImage(compressed, "JPEG", x, y, w, h, undefined, "FAST");

                } catch (err) {
                    console.warn("Skipping image:", err);
                }

                processed++;
                const percent = Math.round((processed / total) * 100);
                showToast(`Creating PDF... ${percent}%`, 1000);

                await new Promise(r => setTimeout(r, MIN_TICK));
            }

            await new Promise(r => setTimeout(r, 30));
        }

        setStatus("Finalizing PDF...");
        showToast("Finalizing PDF...", 800);

        const blob = pdf.output("blob");
        const pdfFile = new File([blob], "Snap2Pdf_compressed.pdf", { type: "application/pdf" });

        showToast("PDF is ready!", 1200);
        setStatus("");

        // Force Share
        try {
            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: "Snap2Pdf",
                    text: "Here is your PDF"
                });
            } else {
                pdf.save("Snap2Pdf_compressed.pdf");
            }
        } catch (e) {
            console.warn("Share failed, fallback save", e);
            pdf.save("Snap2Pdf_compressed.pdf");
        }

    } catch (err) {
        console.error("Unexpected error:", err);
        showToast("Error occurred. See console.", 2000);
        setStatus("");
    }
});

// ---------- service worker ----------
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}







































// // Snap2Pdf - Maximum Quality + Fast Mode

// let pickedImages = [];
// let pdfSize = "a4";

// /* ---------- Toast ---------- */
// function showToast(msg = "", duration = 2000) {
//     const t = document.getElementById("toast");
//     t.innerText = msg;
//     t.classList.add("show");
//     clearTimeout(showToast._t);
//     showToast._t = setTimeout(() => t.classList.remove("show"), duration);
// }

// /* ---------- انتخاب عکس ---------- */
// document.getElementById("imagePicker").addEventListener("change", async (e) => {
//     showToast("Loading photos...");
//     pickedImages = Array.from(e.target.files || []);
//     await new Promise(r => setTimeout(r, 40));
//     showToast(`Selected: ${pickedImages.length} photos`, 1200);
// });

// /* ---------- انتخاب سایز ---------- */
// document.querySelectorAll(".size-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         document.querySelectorAll(".size-btn").forEach(x => x.classList.remove("active"));
//         btn.classList.add("active");
//         pdfSize = btn.dataset.size;
//     });
// });

// /* ---------- Base64 Reader ---------- */
// function fileToBase64(file) {
//     return new Promise(res => {
//         const reader = new FileReader();
//         reader.onload = () => res(reader.result);
//         reader.readAsDataURL(file);
//     });
// }

// /* ---------- Load Image ---------- */
// function loadImage(src) {
//     return new Promise((res, rej) => {
//         const img = new Image();
//         img.onload = () => res(img);
//         img.onerror = rej;
//         img.src = src;
//     });
// }

// /* ---------- PDF Generation (MAX QUALITY + FAST) ---------- */
// document.getElementById("convertBtn").addEventListener("click", async () => {
//     if (!pickedImages.length) {
//         showToast("Select images first.", 2000);
//         return;
//     }

//     showToast("Creating PDF...");

//     const { jsPDF } = window.jspdf;

//     const pdf = new jsPDF({
//         unit: "px",
//         format: pdfSize === "fit" ? "a4" : pdfSize,
//         compress: false          // ← بیشترین کیفیت، بدون فشرده‌سازی
//     });

//     const pageW = pdf.internal.pageSize.getWidth();
//     const pageH = pdf.internal.pageSize.getHeight();

//     const CHUNK = 8;
//     for (let i = 0; i < pickedImages.length; i++) {

//         if (i % CHUNK === 0) await new Promise(r => setTimeout(r, 25));

//         const base64 = await fileToBase64(pickedImages[i]);
//         const img = await loadImage(base64);

//         const maxW = pageW - 20;
//         const maxH = pageH - 20;
//         const scale = Math.min(maxW / img.width, maxH / img.height, 1);
//         const w = img.width * scale;
//         const h = img.height * scale;

//         const x = (pageW - w) / 2;
//         const y = (pageH - h) / 2;

//         if (i !== 0) pdf.addPage();

//         pdf.addImage(base64, "JPEG", x, y, w, h, undefined, "NONE", 1.0);
//     }

//     const blob = pdf.output("blob");
//     const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });

//     showToast("PDF Ready!");

//     if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
//         try { await navigator.share({ files: [pdfFile] }); } catch { }
//     } else {
//         pdf.save("Snap2Pdf.pdf");
//     }
// });



