let pickedImages = [];
let pdfSize = "zeroloss"; // حالت پیش‌فرض

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

// ---------- Helpers ----------
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
    const format = dataUrl.includes("png") ? "PNG" : "JPEG";
    return { dataUrl, bitmap, format };
}

function getA4SizePx() {
    const DPI = 96;
    return [Math.round(8.27 * DPI), Math.round(11.69 * DPI)];
}

// ---------- Zero-Loss fixer ----------
async function prepareZeroLossImage(imgObj) {
    const MAX = 14000;

    let w = imgObj.bitmap.width;
    let h = imgObj.bitmap.height;

    // محدود کردن سایز jsPDF
    const ratio = Math.min(MAX / w, MAX / h, 1);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);

    // عکس‌های خیلی کشیده یا کوچک → padded canvas
    if (w < 50 || h < 50) {
        const pad = 100;
        const canvas = document.createElement("canvas");
        canvas.width = w + pad;
        canvas.height = h + pad;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgObj.bitmap, pad / 2, pad / 2, w, h);
        return { dataUrl: canvas.toDataURL("image/png"), w: canvas.width, h: canvas.height, format: "PNG" };
    }

    // تبدیل CMYK و یا MIME عجیب → PNG
    if (!imgObj.dataUrl.startsWith("data:image/")) {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgObj.bitmap, 0, 0, w, h);
        return { dataUrl: canvas.toDataURL("image/png"), w, h, format: "PNG" };
    }

    // حالت عادی: scale فقط برای سقف jsPDF
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgObj.bitmap, 0, 0, w, h);

    return { dataUrl: canvas.toDataURL("image/png"), w, h, format: "PNG" };
}

// ---------- Main PDF creation ----------
convertBtn.addEventListener("click", async () => {
    if (!pickedImages.length) {
        showToast("Select photos first");
        return;
    }

    setStatus("Preparing PDF...");
    const { jsPDF } = window.jspdf;
    const MAX_PAGE_SIZE = 14000;

    // ---------- Process first image ----------
    const first = await processImageRaw(pickedImages[0]);
    let pageW, pageH;
    let pdf;

    if (pdfSize === "zeroloss") {
        const fixed = await prepareZeroLossImage(first);
        pageW = fixed.w;
        pageH = fixed.h;
        pdf = new jsPDF({ unit: "px", format: [pageW, pageH], compress: false });
        pdf.addImage(fixed.dataUrl, fixed.format, 0, 0, pageW, pageH);
    } else if (pdfSize === "a4") {
        [pageW, pageH] = getA4SizePx();
        pdf = new jsPDF({ unit: "px", format: [pageW, pageH], compress: false });

        const scale = Math.min(pageW / first.bitmap.width, pageH / first.bitmap.height);
        const w = first.bitmap.width * scale;
        const h = first.bitmap.height * scale;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        pdf.addImage(first.dataUrl, first.format, x, y, w, h);
    } else if (pdfSize === "fit") {
        pageW = Math.min(first.bitmap.width, MAX_PAGE_SIZE);
        pageH = Math.min(first.bitmap.height, MAX_PAGE_SIZE);
        pdf = new jsPDF({ unit: "px", format: [pageW, pageH], compress: false });
        pdf.addImage(first.dataUrl, first.format, 0, 0, pageW, pageH);
    }

    // ---------- Process remaining images ----------
    for (let i = 1; i < pickedImages.length; i++) {
        const img = await processImageRaw(pickedImages[i]);

        let drawObj;
        if (pdfSize === "zeroloss") drawObj = await prepareZeroLossImage(img);
        else drawObj = img;

        pdf.addPage([drawObj.w || pageW, drawObj.h || pageH]);

        if (pdfSize === "zeroloss" || pdfSize === "fit") {
            pdf.addImage(drawObj.dataUrl, drawObj.format, 0, 0, drawObj.w, drawObj.h);
        } else if (pdfSize === "a4") {
            const scale = Math.min(pageW / img.bitmap.width, pageH / img.bitmap.height);
            const w = img.bitmap.width * scale;
            const h = img.bitmap.height * scale;
            const x = (pageW - w) / 2;
            const y = (pageH - h) / 2;
            pdf.addImage(img.dataUrl, img.format, x, y, w, h);
        }

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



