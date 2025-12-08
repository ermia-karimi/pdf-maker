// ==================== app.js ====================
// Snap2PDF Ultimate: pdf-lib + Fit / A4 / Letter + Zero Compression

import { PDFDocument } from 'pdf-lib';

let pickedImages = [];
const inputEl = document.getElementById("imagePicker");
const convertBtn = document.getElementById("convertBtn");
const statusEl = document.getElementById("hh11");
const sizeButtons = document.getElementById("sizeButtons");
let pdfSize = "a4";

function setStatus(t){ statusEl.innerText = t; }

inputEl.addEventListener("change", (e) => {
    pickedImages = Array.from(e.target.files || []);
    setStatus(`Selected ${pickedImages.length} images`);
});

sizeButtons.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".size-btn");
    if (!btn) return;
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    pdfSize = btn.dataset.size || "a4";
});

async function fileToArrayBuffer(file){
    return await file.arrayBuffer();
}

async function buildPDF(){
    if (!pickedImages.length){ alert("Select images first."); return; }
    setStatus("Creating PDF...");

    const pdfDoc = await PDFDocument.create();

    let pageW, pageH;
    let startIndex = 0;

    if (pdfSize === "fit") {
        const file = pickedImages[0];
        const arrayBuffer = await fileToArrayBuffer(file);
        let img;
        if(file.type.includes('png')) img = await pdfDoc.embedPng(arrayBuffer);
        else img = await pdfDoc.embedJpg(arrayBuffer);

        pageW = img.width;
        pageH = img.height;
        const page = pdfDoc.addPage([pageW, pageH]);
        page.drawImage(img, { x:0, y:0, width: pageW, height: pageH });
        startIndex = 1;
    } else {
        const sizes = {
            a4: [595, 842],
            letter: [612, 792]
        };
        [pageW, pageH] = sizes[pdfSize] || [595, 842];
    }

    let done = startIndex;
    for(let i=startIndex;i<pickedImages.length;i++){
        const file = pickedImages[i];
        const arrayBuffer = await fileToArrayBuffer(file);
        let img;
        if(file.type.includes('png')) img = await pdfDoc.embedPng(arrayBuffer);
        else img = await pdfDoc.embedJpg(arrayBuffer);

        const page = pdfDoc.addPage([pageW, pageH]);

        const scale = Math.min(pageW/img.width, pageH/img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (pageW-w)/2;
        const y = (pageH-h)/2;

        page.drawImage(img, { x, y, width: w, height: h });

        done++;
        setStatus(`Processed ${done}/${pickedImages.length}`);
        await new Promise(r=>setTimeout(r,1));
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], {type:'application/pdf'});
    const fileOut = new File([blob], 'Snap2Pdf_FullQuality.pdf', {type:'application/pdf'});

    if(navigator.canShare && navigator.canShare({files:[fileOut]})){
        await navigator.share({ files:[fileOut], title: 'PDF', text:'Your PDF is ready' });
    } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(fileOut);
        a.download = fileOut.name;
        a.click();
    }

    setStatus("Done.");
}

convertBtn.addEventListener("click", buildPDF);
