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

    let format = "";
    const mime = dataUrl.substring(5, dataUrl.indexOf(";"));

    if (mime === "image/png") format = "PNG";
    else if (mime === "image/jpeg") format = "JPEG";
    else format = "PNG"; // fallback

    return { dataUrl, bitmap, format };
}

function getA4SizePx() {
    const DPI = 96;
    return [
        Math.round(8.27 * DPI),
        Math.round(11.69 * DPI)
    ];
}

convertBtn.addEventListener("click", async () => {
    if (!pickedImages.length) {
        showToast("Select photos first");
        return;
    }

    const mode = pdfSize;
    const { jsPDF } = window.jspdf;

    const first = await processImageRaw(pickedImages[0]);

    let pageW, pageH;
    let pdf;

    if (mode === "zeroloss") {
        pageW = first.bitmap.width;
        pageH = first.bitmap.height;
    } 
    else if (mode === "a4") {
        [pageW, pageH] = getA4SizePx();
    } 
    else if (mode === "fit") {
        pageW = first.bitmap.width;
        pageH = first.bitmap.height;
    }

    if (!pageW || !pageH) {
        console.error("Invalid page size!", { pageW, pageH });
        showToast("Photo size invalid");
        return;
    }

    pdf = new jsPDF({
        unit: "px",
        format: [pageW, pageH],
        compress: false
    });

    function draw(img) {
        if (mode === "zeroloss" || mode === "fit") {
            pdf.addImage(img.dataUrl, img.format, 0, 0, pageW, pageH);
        } 
        else if (mode === "a4") {
            const scale = Math.min(pageW / img.bitmap.width, pageH / img.bitmap.height);
            const w = img.bitmap.width * scale;
            const h = img.bitmap.height * scale;
            const x = (pageW - w) / 2;
            const y = (pageH - h) / 2;

            pdf.addImage(img.dataUrl, img.format, x, y, w, h);
        }
    }

    draw(first);

    for (let i = 1; i < pickedImages.length; i++) {
        const p = await processImageRaw(pickedImages[i]);
        pdf.addPage([pageW, pageH]);
        draw(p);
    }

    pdf.save("Snap2PDF_Final.pdf");
});;






































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



