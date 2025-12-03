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



















let pickedImages = [];
let pdfSize = 'a4';

document.getElementById("imagePicker").onchange = (e) => {
    document.getElementById("hh11").innerText = " Wait Please "
    pickedImages = [...e.target.files];
    pickedImages.reverse();
    document.getElementById("hh11").innerText = "  "
};

document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        pdfSize = btn.dataset.size;
    });
});
document.querySelector(`.size-btn[data-size="${pdfSize}"]`).classList.add("active");


document.getElementById("convertBtn").onclick = async () => {

    document.getElementById("hh11").innerText = " Wait Please "

    if (!pickedImages.length) return;

    const { jsPDF } = window.jspdf;
    let pdf;
    if (pdfSize === 'a4') pdf = new jsPDF({ unit: "px", format: "a4" });
    else if (pdfSize === 'letter') pdf = new jsPDF({ unit: "px", format: "letter" });
    else pdf = new jsPDF({ unit: "px", format: "a4" });

    for (let i = 0; i < pickedImages.length; i++) {
        const file = pickedImages[i];

        // تبدیل تصویر → Canvas → JPEG معتبر
        const imgData = await convertToJpeg(file);
        const imgEl = await loadImage(imgData);

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        const maxW = pageWidth - margin * 2;
        const maxH = pageHeight - margin * 2;

        const ratio = Math.min(maxW / imgEl.width, maxH / imgEl.height);

        const drawW = imgEl.width * ratio;
        const drawH = imgEl.height * ratio;

        const x = (pageWidth - drawW) / 2;
        const y = (pageHeight - drawH) / 2;

        if (i !== 0) pdf.addPage();

        // **اینجا مشکل اصلی بود → فرمت JPEG اجباری**
        pdf.addImage(imgData, "JPEG", x, y, drawW, drawH, undefined, "FAST");

        await new Promise(r => setTimeout(r, 10));
    }

    const pdfBlob = pdf.output("blob");
    const file = new File([pdfBlob], "Snap2Pdf.pdf", { type: "application/pdf" });

    document.getElementById("hh11").innerText = " Completion "


    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file] // فقط فایل، بدون متن
            });
        } catch (e) { }
    } else {

        pdf.save("output.pdf");
    }
};


// ------------------------
// توابع کمکی
// ------------------------

function convertToJpeg(file) {
    return new Promise(res => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                res(canvas.toDataURL("image/jpeg", 0.95));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function loadImage(src) {
    return new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
    });
}

