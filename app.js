let pickedImages = [];
let pdfSize = "zeroloss"; // default mode

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
    console.log(text);
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
    pdfSize = btn.dataset.size || "zeroloss";
});

// ---------- Image processing ----------
async function fileToDataURL(file) {
    return new Promise(res => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(file);
    });
}

async function processImageRaw(file) {
    const dataUrl = await fileToDataURL(file);
    const bitmap = await createImageBitmap(file);
    const format = (dataUrl.includes("png") ? "PNG" : "JPEG");
    return { dataUrl, bitmap, format };
}

// ---------- A4 size helper ----------
function getA4SizePx() {
    const DPI = 96;
    return [Math.round(8.27 * DPI), Math.round(11.69 * DPI)];
}

// ---------- Main PDF creation ----------
convertBtn.addEventListener("click", async () => {
    if (!pickedImages.length) {
        showToast("Select photos first");
        return;
    }

    setStatus("Preparing PDF...");
    const { jsPDF } = window.jspdf;
    const MAX_PAGE_SIZE = 14000; // jsPDF internal limit

    // Process first image
    const first = await processImageRaw(pickedImages[0]);
    let pageW, pageH;

    if (pdfSize === "zeroloss" || pdfSize === "fit") {
        pageW = Math.min(first.bitmap.width, MAX_PAGE_SIZE);
        pageH = Math.min(first.bitmap.height, MAX_PAGE_SIZE);
    } else if (pdfSize === "a4") {
        [pageW, pageH] = getA4SizePx();
    }

    if (!Number.isFinite(pageW) || !Number.isFinite(pageH) || pageW <= 0 || pageH <= 0) {
        showToast("Invalid photo size", 2000);
        return;
    }

    const pdf = new jsPDF({
        unit: "px",
        format: [pageW, pageH],
        compress: false
    });

    // ---------- Draw function ----------
    function drawImageOnPage(img, pageW, pageH, mode) {
        if (mode === "zeroloss" || mode === "fit") {
            pdf.addImage(img.dataUrl, img.format, 0, 0, pageW, pageH);
        } else if (mode === "a4") {
            const scale = Math.min(pageW / img.bitmap.width, pageH / img.bitmap.height);
            const w = img.bitmap.width * scale;
            const h = img.bitmap.height * scale;
            const x = (pageW - w) / 2;
            const y = (pageH - h) / 2;
            pdf.addImage(img.dataUrl, img.format, x, y, w, h);
        }
    }

    drawImageOnPage(first, pageW, pageH, pdfSize);

    // ---------- Process remaining images ----------
    for (let i = 1; i < pickedImages.length; i++) {
        const img = await processImageRaw(pickedImages[i]);
        pdf.addPage([pageW, pageH]);
        drawImageOnPage(img, pageW, pageH, pdfSize);
        setStatus(`Processed ${i + 1} / ${pickedImages.length}`);
    }

    pdf.save("Snap2PDF_Final.pdf");
    setStatus("PDF ready!");
    showToast("PDF generated!", 1200);
});

// ---------- Service Worker ----------
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



