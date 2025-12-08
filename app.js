// app.js — Snap2Pdf Ultra-Fast (No Compression / No Resize)
let pickedImages = [];
let pdfSize = "a4";

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

// ---------- Helpers ----------
function fileToDataSrc(file) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
    });
}
function loadImage(src) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.crossOrigin = "anonymous";
        img.src = src;
    });
}

// ---------- Main PDF creation ----------
convertBtn.addEventListener("click", async () => {
    try {
        if (!pickedImages.length) {
            showToast("Please select photos first", 2000);
            return;
        }

        setStatus("");
        showToast("Preparing PDF...");

        const { jsPDF } = window.jspdf;
        let pdf;
        let pageW, pageH;

        if (pdfSize === "fit") {
            setStatus("Processing first image for Fit...");
            const firstSrc = await fileToDataSrc(pickedImages[0]);
            const firstImg = await loadImage(firstSrc);
            const maxDim = Math.max(firstImg.width, firstImg.height);
            const cap = 2500;
            const scale = Math.min(cap / maxDim, 1);
            pageW = Math.round(firstImg.width * scale);
            pageH = Math.round(firstImg.height * scale);

            pdf = new jsPDF({ unit: "px", format: [pageW, pageH], compress: true, worker: true });

            const w = Math.round(firstImg.width * scale);
            const h = Math.round(firstImg.height * scale);
            const x = Math.round((pageW - w) / 2);
            const y = Math.round((pageH - h) / 2);

            pdf.addImage(firstSrc, "JPEG", x, y, w, h, undefined, "FAST");
        } else {
            pdf = new jsPDF({ unit: "px", format: pdfSize, compress: true, worker: true });
            pageW = pdf.internal.pageSize.getWidth();
            pageH = pdf.internal.pageSize.getHeight();
        }

        const total = pickedImages.length;
        let processed = (pdfSize === "fit") ? 1 : 0;
        const startIndex = (pdfSize === "fit") ? 1 : 0;

        for (let s = startIndex; s < total; s++) {
            setStatus(`Processing ${s + 1} / ${total}`);
            try {
                const src = await fileToDataSrc(pickedImages[s]);
                const img = await loadImage(src);

                const maxW = pageW - 20;
                const maxH = pageH - 20;
                const scale = Math.min(maxW / img.width, maxH / img.height, 1);
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                const x = Math.round((pageW - w) / 2);
                const y = Math.round((pageH - h) / 2);

                if (!(pdfSize === "fit" && s === 0)) pdf.addPage([pageW, pageH]);
                pdf.addImage(src, "JPEG", x, y, w, h, undefined, "FAST");
            } catch (err) {
                console.warn("Skipping image due to error:", err);
            }

            processed++;
            const percent = Math.round((processed / total) * 100);
            showToast(`Creating PDF... ${percent}%`, 900);
        }

        setStatus("Finalizing PDF...");
        showToast("Finalizing PDF...", 800);

        const blob = pdf.output("blob");
        const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });

        showToast("PDF is ready!", 1200);
        setStatus("");

        try {
            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({ files: [pdfFile], title: "Snap2Pdf", text: "Here is your PDF" });
            } else {
                pdf.save("Snap2Pdf.pdf");
            }
        } catch (e) {
            console.warn("Share failed, fallback to save", e);
            pdf.save("Snap2Pdf.pdf");
        }

    } catch (err) {
        console.error("Unexpected error:", err);
        showToast("Error occurred. See console.", 2000);
        setStatus("");
    }
});

// service worker
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



