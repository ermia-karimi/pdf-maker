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
//         pdf.save("output.pdf");
//     }
// };








// Snap2Pdf - نسخه نهایی با Fit واقعی
let pickedImages = [];
let pdfSize = "a4";

/* ---------- Toast ---------- */
function showToast(msg = "", duration = 2000) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.remove("show"), duration);
}

/* ---------- انتخاب عکس ---------- */
document.getElementById("imagePicker").addEventListener("change", async (e) => {
    showToast("Loading photos...");
    pickedImages = Array.from(e.target.files || []);
    // ترتیب همان ترتیب انتخاب کاربر است (هیچ reverse ای انجام نمی‌شود)

    // اجازه بده UI واکنش نشان دهد
    await new Promise(r => setTimeout(r, 40));

    showToast(`تعداد عکس: ${pickedImages.length}`, 1200);
});

/* ---------- انتخاب سایز ---------- */
document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".size-btn").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        pdfSize = btn.dataset.size;
    });
});

/* ---------- تبدیل فایل -> base64 ---------- */
function fileToBase64(file) {
    return new Promise(res => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(file);
    });
}

/* ---------- لود تصویر برای به‌دست آوردن ابعاد ---------- */
function loadImage(src) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
    });
}

/* ---------- محدودیت اندازه صفحه در حالت fit (px) ---------- */
const FIT_MAX_DIM = 2000; // حداکثر اندازه صفحه برای fit (از افتادن حافظه جلوگیری می‌کند)

/* ---------- تابع کمکی برای محاسبه اندازه صفحه در حالت fit ---------- */
function calcFitPageSize(imgWidth, imgHeight) {
    // اگر تصویر خیلی بزرگ است، مقیاس می‌کنیم تا max dimension از FIT_MAX_DIM تجاوز نکند
    const maxDim = Math.max(imgWidth, imgHeight);
    if (maxDim <= FIT_MAX_DIM) return [imgWidth, imgHeight];

    const scale = FIT_MAX_DIM / maxDim;
    return [Math.round(imgWidth * scale), Math.round(imgHeight * scale)];
}

/* ---------- ساخت PDF (پشتیبانی از حالت fit) ---------- */
document.getElementById("convertBtn").addEventListener("click", async () => {
    if (!pickedImages.length) {
        showToast("First select the photos.", 2000);
        return;
    }

    showToast("Creating PDF...", 2000);

    const { jsPDF } = window.jspdf;

    // اگر حالت fit است، باید اندازه صفحه را با اولین تصویر بسازیم
    if (pdfSize === "fit") {
        // خواندن اولین تصویر برای ساخت pdf با اندازه مناسب
        const firstBase64 = await fileToBase64(pickedImages[0]);
        const firstImg = await loadImage(firstBase64);
        const [pageW, pageH] = calcFitPageSize(firstImg.width, firstImg.height);

        // pdf با فرمت صفحهٔ سفارشی
        const pdf = new jsPDF({ unit: "px", format: [pageW, pageH], compress: true, worker: true });

        // اضافه کردن اولین تصویر (با مقیاس نسبت به همان صفحه)
        {
            const img = firstImg;
            const maxW = pageW;
            const maxH = pageH;
            const scale = Math.min(maxW / img.width, maxH / img.height, 1);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (pageW - w) / 2;
            const y = (pageH - h) / 2;
            pdf.addImage(firstBase64, "JPEG", x, y, w, h, undefined, "FAST");
        }

        // پردازش مابقی تصاویر (هر صفحه با همان اندازهٔ pageW,pageH)
        for (let i = 1; i < pickedImages.length; i++) {
            const base64 = await fileToBase64(pickedImages[i]);
            const img = await loadImage(base64);

            pdf.addPage([pageW, pageH]); // صفحه جدید با همان اندازه
            const maxW = pageW;
            const maxH = pageH;
            const scale = Math.min(maxW / img.width, maxH / img.height, 1);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (pageW - w) / 2;
            const y = (pageH - h) / 2;
            pdf.addImage(base64, "JPEG", x, y, w, h, undefined, "FAST");

            // اجازه بده UI آپدیت شود
            await new Promise(r => setTimeout(r, 5));
        }

        // خروجی و اشتراک
        const blob = pdf.output("blob");
        const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });
        showToast("PDF آماده شد!", 1200);
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try { await navigator.share({ files: [pdfFile] }); } catch (e) { }
        } else pdf.save("Snap2Pdf.pdf");

        return;
    }

    // حالت‌های استاندارد a4 یا letter: یک pdf با آن فرمت می‌سازیم و همه تصاویر را در صفحات آن اضافه می‌کنیم
    const pdf = new jsPDF({ unit: "px", format: pdfSize, compress: true, worker: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pickedImages.length; i++) {
        const base64 = await fileToBase64(pickedImages[i]);
        const img = await loadImage(base64);

        const maxW = pageW - 20;
        const maxH = pageH - 20;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;

        if (i !== 0) pdf.addPage();
        pdf.addImage(base64, "JPEG", x, y, w, h, undefined, "FAST");

        await new Promise(r => setTimeout(r, 5));
    }

    const blob = pdf.output("blob");
    const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });
    showToast("PDF is ready!", 1200);
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try { await navigator.share({ files: [pdfFile] }); } catch (e) { }
    } else pdf.save("Snap2Pdf.pdf");
});






