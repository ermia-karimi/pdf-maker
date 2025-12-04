// let pickedImages = [];
// let pdfSize = 'a4';

// // انتخاب عکس‌ها
// document.getElementById("imagePicker").onchange = (e) => {
//     document.getElementById("hh11").innerText = " Wait Please "
//     pickedImages = [...e.target.files];
//     // اصلاح ترتیب: اطمینان از ترتیب انتخاب از اول به آخر
//     pickedImages.reverse();

//     document.getElementById("hh11").innerText = "  "
// };



// // انتخاب سایز PDF
// document.querySelectorAll(".size-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
//         btn.classList.add("active");
//         pdfSize = btn.dataset.size;
//     });
// });
// document.querySelector(`.size-btn[data-size="${pdfSize}"]`).classList.add("active");

// // تبدیل تصاویر به PDF بدون کاهش حجم، بدون نمایش
// document.getElementById("convertBtn").onclick = async () => {
//     document.getElementById("hh11").innerText = " Wait Please "
//     if (!pickedImages.length) return;

//     const { jsPDF } = window.jspdf;
//     let pdf;
//     if (pdfSize === 'a4') pdf = new jsPDF({ unit: "px", format: "a4" });
//     else if (pdfSize === 'letter') pdf = new jsPDF({ unit: "px", format: "letter" });
//     else pdf = new jsPDF({ unit: "px", format: "a4" }); // fit

//     for (let i = 0; i < pickedImages.length; i++) {
//         const file = pickedImages[i];
//         const imgData = await fileToDataURL(file);
//         const imgEl = await loadImage(imgData);

//         let pageWidth = pdf.internal.pageSize.getWidth();
//         let pageHeight = pdf.internal.pageSize.getHeight();
//         const margin = 10;

//         const maxW = pageWidth - margin * 2;
//         const maxH = pageHeight - margin * 2;
//         const ratio = Math.min(maxW / imgEl.width, maxH / imgEl.height, 1);
//         const drawW = imgEl.width * ratio;
//         const drawH = imgEl.height * ratio;
//         const x = (pageWidth - drawW) / 2;
//         const y = (pageHeight - drawH) / 2;

//         if (i !== 0) pdf.addPage();
//         pdf.addImage(imgData, 'JPEG', x, y, drawW, drawH);

//         // اجازه بده UI آپدیت شود
//         await new Promise(r => setTimeout(r, 0));
//     }

//     document.getElementById("hh11").innerText = " Completion "

//     pdf.save("pdf_maker.pdf");
// };

// // توابع کمکی
// function fileToDataURL(file) {
//     return new Promise(res => {
//         const reader = new FileReader();
//         reader.onload = () => res(reader.result);
//         reader.readAsDataURL(file);
//     });
// }

// function loadImage(src) {
//     return new Promise(res => {
//         const img = new Image();
//         img.onload = () => res(img);
//         img.src = src;
//     });
// }

























































// let pickedImages = [];
// let pdfSize = 'a4';

// document.getElementById("imagePicker").onchange = (e) => {
//     document.getElementById("hh11").innerText = " Wait Please "
//     pickedImages = [...e.target.files];
//     pickedImages.reverse();
//     document.getElementById("hh11").innerText = "  "
// };

// document.querySelectorAll(".size-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
//         btn.classList.add("active");
//         pdfSize = btn.dataset.size;
//     });
// });
// document.querySelector(`.size-btn[data-size="${pdfSize}"]`).classList.add("active");


// document.getElementById("convertBtn").onclick = async () => {

//     document.getElementById("hh11").innerText = " Wait Please "

//     if (!pickedImages.length) return;

//     const { jsPDF } = window.jspdf;
//     let pdf;
//     if (pdfSize === 'a4') pdf = new jsPDF({ unit: "px", format: "a4" });
//     else if (pdfSize === 'letter') pdf = new jsPDF({ unit: "px", format: "letter" });
//     else pdf = new jsPDF({ unit: "px", format: "a4" });

//     for (let i = 0; i < pickedImages.length; i++) {
//         const file = pickedImages[i];

//         // تبدیل تصویر → Canvas → JPEG معتبر
//         const imgData = await convertToJpeg(file);
//         const imgEl = await loadImage(imgData);

//         const pageWidth = pdf.internal.pageSize.getWidth();
//         const pageHeight = pdf.internal.pageSize.getHeight();
//         const margin = 10;

//         const maxW = pageWidth - margin * 2;
//         const maxH = pageHeight - margin * 2;

//         const ratio = Math.min(maxW / imgEl.width, maxH / imgEl.height);

//         const drawW = imgEl.width * ratio;
//         const drawH = imgEl.height * ratio;

//         const x = (pageWidth - drawW) / 2;
//         const y = (pageHeight - drawH) / 2;

//         if (i !== 0) pdf.addPage();

//         // **اینجا مشکل اصلی بود → فرمت JPEG اجباری**
//         pdf.addImage(imgData, "JPEG", x, y, drawW, drawH, undefined, "FAST");

//         await new Promise(r => setTimeout(r, 10));
//     }

//     const pdfBlob = pdf.output("blob");
//     const file = new File([pdfBlob], "Snap2Pdf.pdf", { type: "application/pdf" });

//     document.getElementById("hh11").innerText = " Completion "


//     if (navigator.canShare && navigator.canShare({ files: [file] })) {
//         try {
//             await navigator.share({
//                 files: [file] // فقط فایل، بدون متن
//             });
//         } catch (e) { }
//     } else {

//         pdf.save("output.pdf");
//     }
// };


// // ------------------------
// // توابع کمکی
// // ------------------------

// function convertToJpeg(file) {
//     return new Promise(res => {
//         const reader = new FileReader();
//         reader.onload = () => {
//             const img = new Image();
//             img.onload = () => {
//                 const canvas = document.createElement("canvas");
//                 canvas.width = img.width;
//                 canvas.height = img.height;
//                 const ctx = canvas.getContext("2d");
//                 ctx.drawImage(img, 0, 0);
//                 res(canvas.toDataURL("image/jpeg", 0.95));
//             };
//             img.src = reader.result;
//         };
//         reader.readAsDataURL(file);
//     });
// }

// function loadImage(src) {
//     return new Promise(res => {
//         const img = new Image();
//         img.onload = () => res(img);
//         img.src = src;
//     });
// }























































// let pickedImages = [];
// let pdfSize = "a4";

// // انتخاب عکس
// document.getElementById("imagePicker").onchange = (e) => {
//     document.getElementById("hh11").innerText = " Wait Please "
//     pickedImages = [...e.target.files];
//     pickedImages.reverse();
//     document.getElementById("hh11").innerText = "  "
// };



// // انتخاب سایز PDF
// document.querySelectorAll(".size-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
//         btn.classList.add("active");
//         pdfSize = btn.dataset.size;
//     });
// });
// document.querySelector(`.size-btn[data-size="${pdfSize}"]`).classList.add("active");


// // تبدیل فایل → Base64 بدون canvas (سریع‌ترین)
// function fileToBase64(file) {
//     return new Promise(res => {
//         const reader = new FileReader();
//         reader.onload = () => res(reader.result);
//         reader.readAsDataURL(file);
//     });
// }

// // لود تصویر برای گرفتن عرض/ارتفاع
// function loadImage(src) {
//     return new Promise(res => {
//         const img = new Image();
//         img.onload = () => res(img);
//         img.src = src;
//     });
// }


// // دکمه ساخت PDF
// document.getElementById("convertBtn").onclick = async () => {

//     document.getElementById("hh11").innerText = " Wait Please "

//     if (pickedImages.length === 0) return;

//     const { jsPDF } = window.jspdf;

//     const pdf = new jsPDF({
//         unit: "px",
//         format: pdfSize,
//         compress: true,
//         worker: true
//     });

//     for (let i = 0; i < pickedImages.length; i++) {

//         const file = pickedImages[i];

//         // تبدیل مستقیم فایل → Base64 (بدون canvas)
//         const base64 = await fileToBase64(file);

//         // لود تصویر واقعی
//         const img = await loadImage(base64);

//         const pageW = pdf.internal.pageSize.getWidth();
//         const pageH = pdf.internal.pageSize.getHeight();

//         const maxW = pageW - 20;
//         const maxH = pageH - 20;

//         const ratio = Math.min(maxW / img.width, maxH / img.height);

//         const w = img.width * ratio;
//         const h = img.height * ratio;

//         const x = (pageW - w) / 2;
//         const y = (pageH - h) / 2;

//         if (i !== 0) pdf.addPage();

//         // WebP اگر پشتیبانی نشد خودش JPEG می‌کنه
//         pdf.addImage(base64, "JPEG", x, y, w, h, undefined, "FAST");

//         await new Promise(r => setTimeout(r, 5)); // جلوگیری از هنگی موبایل
//     }

//     // خروجی PDF
//     const blob = pdf.output("blob");
//     const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });

//     document.getElementById("hh11").innerText = " Completion "

//     // اشتراک گذاری (بدون متن اضافی)
//     if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
//         await navigator.share({ files: [pdfFile] });
//     } else {
//         pdf.save("Snap2Pdf.pdf");
//     }
// };








// // Snap2Pdf - نسخه نهایی با Fit واقعی
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
//     // ترتیب همان ترتیب انتخاب کاربر است (هیچ reverse ای انجام نمی‌شود)

//     // اجازه بده UI واکنش نشان دهد
//     await new Promise(r => setTimeout(r, 40));

//     showToast(`Number of photos: ${pickedImages.length}`, 1200);
// });

// /* ---------- انتخاب سایز ---------- */
// document.querySelectorAll(".size-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         document.querySelectorAll(".size-btn").forEach(x => x.classList.remove("active"));
//         btn.classList.add("active");
//         pdfSize = btn.dataset.size;
//     });
// });

// /* ---------- تبدیل فایل -> base64 ---------- */
// function fileToBase64(file) {
//     return new Promise(res => {
//         const reader = new FileReader();
//         reader.onload = () => res(reader.result);
//         reader.readAsDataURL(file);
//     });
// }

// /* ---------- لود تصویر برای به‌دست آوردن ابعاد ---------- */
// function loadImage(src) {
//     return new Promise((res, rej) => {
//         const img = new Image();
//         img.onload = () => res(img);
//         img.onerror = rej;
//         img.src = src;
//     });
// }

// /* ---------- محدودیت اندازه صفحه در حالت fit (px) ---------- */
// const FIT_MAX_DIM = 2000; // حداکثر اندازه صفحه برای fit (از افتادن حافظه جلوگیری می‌کند)

// /* ---------- تابع کمکی برای محاسبه اندازه صفحه در حالت fit ---------- */
// function calcFitPageSize(imgWidth, imgHeight) {
//     // اگر تصویر خیلی بزرگ است، مقیاس می‌کنیم تا max dimension از FIT_MAX_DIM تجاوز نکند
//     const maxDim = Math.max(imgWidth, imgHeight);
//     if (maxDim <= FIT_MAX_DIM) return [imgWidth, imgHeight];

//     const scale = FIT_MAX_DIM / maxDim;
//     return [Math.round(imgWidth * scale), Math.round(imgHeight * scale)];
// }

// /* ---------- ساخت PDF (پشتیبانی از حالت fit) ---------- */
// document.getElementById("convertBtn").addEventListener("click", async () => {
//     if (!pickedImages.length) {
//         showToast("First select the photos.", 2000);
//         return;
//     }

//     showToast("Creating PDF...", 2000);

//     const { jsPDF } = window.jspdf;

//     // اگر حالت fit است، باید اندازه صفحه را با اولین تصویر بسازیم
//     if (pdfSize === "fit") {
//         // خواندن اولین تصویر برای ساخت pdf با اندازه مناسب
//         const firstBase64 = await fileToBase64(pickedImages[0]);
//         const firstImg = await loadImage(firstBase64);
//         const [pageW, pageH] = calcFitPageSize(firstImg.width, firstImg.height);

//         // pdf با فرمت صفحهٔ سفارشی
//         const pdf = new jsPDF({ unit: "px", format: [pageW, pageH], compress: true, worker: true });

//         // اضافه کردن اولین تصویر (با مقیاس نسبت به همان صفحه)
//         {
//             const img = firstImg;
//             const maxW = pageW;
//             const maxH = pageH;
//             const scale = Math.min(maxW / img.width, maxH / img.height, 1);
//             const w = img.width * scale;
//             const h = img.height * scale;
//             const x = (pageW - w) / 2;
//             const y = (pageH - h) / 2;
//             pdf.addImage(firstBase64, "JPEG", x, y, w, h, undefined, "FAST");
//         }

//         // پردازش مابقی تصاویر (هر صفحه با همان اندازهٔ pageW,pageH)
//         for (let i = 1; i < pickedImages.length; i++) {
//             const base64 = await fileToBase64(pickedImages[i]);
//             const img = await loadImage(base64);

//             pdf.addPage([pageW, pageH]); // صفحه جدید با همان اندازه
//             const maxW = pageW;
//             const maxH = pageH;
//             const scale = Math.min(maxW / img.width, maxH / img.height, 1);
//             const w = img.width * scale;
//             const h = img.height * scale;
//             const x = (pageW - w) / 2;
//             const y = (pageH - h) / 2;
//             pdf.addImage(base64, "JPEG", x, y, w, h, undefined, "FAST");

//             // اجازه بده UI آپدیت شود
//             await new Promise(r => setTimeout(r, 5));
//         }

//         // خروجی و اشتراک
//         const blob = pdf.output("blob");
//         const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });
//         showToast("PDF is ready!", 1200);
//         if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
//             try { await navigator.share({ files: [pdfFile] }); } catch (e) { }
//         } else pdf.save("Snap2Pdf.pdf");

//         return;
//     }

//     // حالت‌های استاندارد a4 یا letter: یک pdf با آن فرمت می‌سازیم و همه تصاویر را در صفحات آن اضافه می‌کنیم
//     const pdf = new jsPDF({ unit: "px", format: pdfSize, compress: true, worker: true });
//     const pageW = pdf.internal.pageSize.getWidth();
//     const pageH = pdf.internal.pageSize.getHeight();

//     for (let i = 0; i < pickedImages.length; i++) {
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
//         pdf.addImage(base64, "JPEG", x, y, w, h, undefined, "FAST");

//         await new Promise(r => setTimeout(r, 5));
//     }

//     const blob = pdf.output("blob");
//     const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });
//     showToast("PDF is ready!", 1200);
//     if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
//         try { await navigator.share({ files: [pdfFile] }); } catch (e) { }
//     } else pdf.save("Snap2Pdf.pdf");
// });


































// app.js — Snap2Pdf (Compressed + Chunked) — compatible with provided HTML

// ---------- CONFIG ----------
const DEFAULT_MAX_DIM = 1500;   // recommended max pixel dimension for longest side
const DEFAULT_QUALITY = 0.85;   // JPEG quality: 0.5 .. 1
const CHUNK_SIZE = 20;          // process this many images per chunk
const MIN_TICK = 3;             // ms to yield to event loop between images

// ---------- state ----------
let pickedImages = [];
let pdfSize = "a4"; // 'a4' | 'letter' | 'fit'

// ---------- DOM refs ----------
const inputEl = document.getElementById("imagePicker");
const toastEl = document.getElementById("toast");
const convertBtn = document.getElementById("convertBtn");
const hh11 = document.getElementById("hh11");
const sizeButtons = document.getElementById("sizeButtons");

// ---------- Toast helper ----------
function showToast(msg = "", duration = 1800) {
    if (!toastEl) return;
    toastEl.innerText = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("show"), duration);
}

// short status line under buttons
function setStatus(text = "") {
    if (!hh11) return;
    hh11.innerText = text;
}

// ---------- event: file select ----------
inputEl.addEventListener("change", async (e) => {
    pickedImages = Array.from(e.target.files || []);
    setStatus("");
    showToast(`Selected ${pickedImages.length} photos`);
    // small pause to allow UI render
    await new Promise(r => setTimeout(r, 40));
});

// ---------- size button handling ----------
sizeButtons.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".size-btn");
    if (!btn) return;
    // toggle active classes (visual)
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    pdfSize = btn.dataset.size || "a4";
});

// ---------- helpers: read file -> dataURL ----------
function fileToDataURL(file) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
    });
}

// ---------- helpers: load image element ----------
function loadImage(src) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        // avoid cross-origin taint for safety (images from local file use blob/data URLs anyway)
        img.crossOrigin = "anonymous";
        img.src = src;
    });
}

// ---------- helpers: compress via canvas (reuse single canvas) ----------
const reuseCanvas = document.createElement("canvas");
const reuseCtx = reuseCanvas.getContext("2d");

function compressImageToDataURL(img, maxDim, quality) {
    // calculate scaled size preserving aspect ratio
    let w = img.width;
    let h = img.height;
    const ratio = Math.min(maxDim / w, maxDim / h, 1);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);

    reuseCanvas.width = w;
    reuseCanvas.height = h;
    reuseCtx.clearRect(0, 0, w, h);
    reuseCtx.drawImage(img, 0, 0, w, h);
    // return JPEG data URL
    return reuseCanvas.toDataURL("image/jpeg", quality);
}

// ---------- process single file: read -> load -> compress (returns dataURL) ----------
async function processImageFile(file, maxDim, quality) {
    const dataUrl = await fileToDataURL(file);
    const img = await loadImage(dataUrl);
    // even if image smaller than maxDim, we redraw to JPEG with desired quality to reduce size
    return compressImageToDataURL(img, maxDim, quality);
}

// ---------- calc fit page size (cap to avoid OOM) ----------
const FIT_MAX_DIM = 2500; // safety cap for page dimension (px)
function calcFitPageSize(imgW, imgH, uiMax) {
    // preferred page size based on compressed image size (we will use compressed dims)
    const maxDim = Math.max(imgW, imgH);
    const cap = Math.min(FIT_MAX_DIM, uiMax || DEFAULT_MAX_DIM);
    if (maxDim <= cap) return [imgW, imgH];
    const scale = cap / maxDim;
    return [Math.round(imgW * scale), Math.round(imgH * scale)];
}

// ---------- main: Create PDF (chunked + compressed) ----------
convertBtn.addEventListener("click", async () => {
    try {
        if (!pickedImages.length) {
            showToast("Please select photos first", 2000);
            return;
        }

        // read UI params (if inputs not present, fallback to defaults)
        const maxDimInput = document.getElementById("maxDim");
        const qualityInput = document.getElementById("quality");
        const uiMax = maxDimInput ? Math.max(600, Math.min(4000, Number(maxDimInput.value) || DEFAULT_MAX_DIM)) : DEFAULT_MAX_DIM;
        const uiQuality = qualityInput ? Math.max(0.5, Math.min(1, Number(qualityInput.value) || DEFAULT_QUALITY)) : DEFAULT_QUALITY;

        setStatus("");
        showToast("Preparing PDF...");

        const { jsPDF } = window.jspdf;
        let pdf;
        let pageW, pageH;

        // FIT mode - determine page size by first compressed image
        if (pdfSize === "fit") {
            setStatus("Processing first image for Fit...");
            // compress first image to get safe dims
            const firstCompressed = await processImageFile(pickedImages[0], uiMax, uiQuality);
            const firstImg = await loadImage(firstCompressed);
            [pageW, pageH] = calcFitPageSize(firstImg.width, firstImg.height, uiMax);
            pdf = new jsPDF({ unit: "px", format: [pageW, pageH], compress: true, worker: true });

            // add first page/image
            {
                const maxW = pageW;
                const maxH = pageH;
                const scale = Math.min(maxW / firstImg.width, maxH / firstImg.height, 1);
                const w = Math.round(firstImg.width * scale);
                const h = Math.round(firstImg.height * scale);
                const x = Math.round((pageW - w) / 2);
                const y = Math.round((pageH - h) / 2);
                pdf.addImage(firstCompressed, "JPEG", x, y, w, h, undefined, "FAST");
            }
        } else {
            // standard A4/Letter
            pdf = new jsPDF({ unit: "px", format: pdfSize, compress: true, worker: true });
            pageW = pdf.internal.pageSize.getWidth();
            pageH = pdf.internal.pageSize.getHeight();
        }

        // chunked processing
        const total = pickedImages.length;
        let processed = (pdfSize === "fit") ? 1 : 0;
        const startIndex = (pdfSize === "fit") ? 1 : 0;

        for (let s = startIndex; s < total; s += CHUNK_SIZE) {
            const chunk = pickedImages.slice(s, s + CHUNK_SIZE);
            for (let i = 0; i < chunk.length; i++) {
                const idx = s + i;
                setStatus(`Processing ${idx + 1} / ${total}`);
                try {
                    const compressed = await processImageFile(chunk[i], uiMax, uiQuality);
                    const img = await loadImage(compressed);

                    const maxW = pageW - 20;
                    const maxH = pageH - 20;
                    const scale = Math.min(maxW / img.width, maxH / img.height, 1);
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);
                    const x = Math.round((pageW - w) / 2);
                    const y = Math.round((pageH - h) / 2);

                    // add new page except when first fit image already added
                    if (!(pdfSize === "fit" && idx === 0)) {
                        pdf.addPage([pageW, pageH]);
                    }
                    pdf.addImage(compressed, "JPEG", x, y, w, h, undefined, "FAST");

                    // free references (hint)
                    // eslint-disable-next-line no-unused-vars
                    let tmp = null;
                } catch (err) {
                    console.warn("Skipping image due to error:", err);
                }

                processed++;
                const percent = Math.round((processed / total) * 100);
                showToast(`Creating PDF... ${percent}%`, 1000);

                // yield to event loop
                await new Promise(r => setTimeout(r, MIN_TICK));
            }

            // small breathing pause after chunk for GC and UI
            await new Promise(r => setTimeout(r, 60));
        }

        setStatus("Finalizing PDF...");
        showToast("Finalizing PDF...", 800);

        // produce blob (this step still takes time but file is much smaller)
        const blob = pdf.output("blob");
        const pdfFile = new File([blob], "Snap2Pdf_compressed.pdf", { type: "application/pdf" });

        showToast("PDF is ready!", 1200);
        setStatus("");

        // share or fallback save
        try {
            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({ files: [pdfFile] });
            } else {
                pdf.save("Snap2Pdf_compressed.pdf");
            }
        } catch (e) {
            console.warn("Share failed, falling back to save:", e);
            try { pdf.save("Snap2Pdf_compressed.pdf"); } catch (_) { console.error("Save failed", _); }
        }
    } catch (err) {
        console.error("Unexpected error in conversion:", err);
        showToast("Error occurred. See console.", 2000);
        setStatus("");
    }
});







