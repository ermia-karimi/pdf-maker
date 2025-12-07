// app.js — Snap2Pdf Ultra-Fast + True Lossless PNG + Fast JPEG + GPU Decode
let pickedImages = [];
let pdfSize = "a4";

// ---------- CONFIG ----------
const DEFAULT_MAX_DIM = 6000;      // بزرگ تا کیفیت نکنی تو ذوق
const CHUNK_SIZE = 20;
const MIN_TICK = 0;                // بدون کندکننده

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

// ---------- SUPER FAST IMAGE PIPELINE ----------
async function fileToBitmap(file) {
    return await createImageBitmap(file, { premultiplyAlpha: "none" });
}

const reuseCanvas = document.createElement("canvas");
const reuseCtx = reuseCanvas.getContext("2d");

/* 
  اینجا PNG و JPG را خودشان تشخیص می‌دهیم:
  - PNG → خروجی PNG (بدون افت)
  - JPG → خروجی JPG (بدون resize)
*/
async function processImageFile(file, maxDim) {
    const bitmap = await fileToBitmap(file);

    // اگر عکس از maxDim بزرگ‌تر نبود → هیچ تغییری نمی‌دهیم
    if (bitmap.width <= maxDim && bitmap.height <= maxDim) {
        return await blobToDataURL(file);
    }

    // باید resize کنیم → PNG یا JPG؟
    const isPNG = file.type.includes("png");

    const ratio = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);

    reuseCanvas.width = w;
    reuseCanvas.height = h;

    reuseCtx.drawImage(bitmap, 0, 0, w, h);

    return await canvasToDataURL(reuseCanvas, isPNG ? "image/png" : "image/jpeg", isPNG ? 1 : 0.98);
}

function canvasToDataURL(canvas, type, quality) {
    return new Promise(res => {
        canvas.toBlob(b => blobToDataURL(b).then(res), type, quality);
    });
}

function blobToDataURL(blob) {
    return new Promise(res => {
        const r = new FileReader();
        r.onloadend = () => res(r.result);
        r.readAsDataURL(blob);
    });
}

// ---------- FIT SIZE ----------
const FIT_MAX_DIM = 6000;
function calcFitPageSize(imgW, imgH, uiMax) {
    const maxDim = Math.max(imgW, imgH);
    const cap = uiMax;
    if (maxDim <= cap) return [imgW, imgH];
    const scale = cap / maxDim;
    return [Math.round(imgW * scale), Math.round(imgH * scale)];
}

// ---------- MAIN PDF CREATION ----------
convertBtn.addEventListener("click", async () => {
    try {
        if (!pickedImages.length) {
            showToast("Please select photos first", 2000);
            return;
        }

        const uiMax = DEFAULT_MAX_DIM;
        setStatus("");
        showToast("Preparing PDF...");

        const { jsPDF } = window.jspdf;
        let pdf;
        let pageW, pageH;

        // FIT MODE FIRST PAGE
        if (pdfSize === "fit") {
            setStatus("Processing first image...");
            const firstCompressed = await processImageFile(pickedImages[0], uiMax);

            const firstBitmap = await createImageBitmap(await (await fetch(firstCompressed)).blob());
            [pageW, pageH] = calcFitPageSize(firstBitmap.width, firstBitmap.height, uiMax);

            pdf = new jsPDF({
                unit: "px",
                format: [pageW, pageH],
                compress: false,
                worker: true
            });

            pdf.addImage(firstCompressed, firstCompressed.includes("png") ? "PNG" : "JPEG",
                0, 0, pageW, pageH);

        } else {
            pdf = new jsPDF({ unit: "px", format: pdfSize, compress: false, worker: true });
            pageW = pdf.internal.pageSize.getWidth();
            pageH = pdf.internal.pageSize.getHeight();
        }

        const total = pickedImages.length;
        let processed = (pdfSize === "fit") ? 1 : 0;
        const startIndex = processed;

        for (let s = startIndex; s < total; s += CHUNK_SIZE) {
            const chunk = pickedImages.slice(s, s + CHUNK_SIZE);

            for (let i = 0; i < chunk.length; i++) {
                const idx = s + i;

                setStatus(`Processing ${idx + 1} / ${total}`);

                try {
                    const dataUrl = await processImageFile(chunk[i], uiMax);

                    pdf.addPage();
                    pdf.addImage(dataUrl,
                        dataUrl.includes("png") ? "PNG" : "JPEG",
                        0, 0, pageW, pageH);

                } catch (err) {
                    console.warn("Skipping image:", err);
                }

                processed++;
                const percent = Math.round((processed / total) * 100);
                showToast(`Creating PDF... ${percent}%`, 1000);

                await new Promise(r => setTimeout(r, MIN_TICK));
            }

            await new Promise(r => setTimeout(r, 10));
        }

        setStatus("Finalizing PDF...");
        showToast("Finalizing PDF...", 800);

        const blob = pdf.output("blob");
        const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });

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
                pdf.save("Snap2Pdf.pdf");
            }
        } catch (e) {
            console.warn("Share failed, fallback save", e);
            pdf.save("Snap2Pdf.pdf");
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



