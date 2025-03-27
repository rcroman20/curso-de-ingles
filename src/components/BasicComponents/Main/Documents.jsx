import React from "react";
import { FileText, Download } from "lucide-react";
import "./Documents.css"; // Importa los estilos

// Lista de PDFs (puedes cambiar las URLs)
const pdfFiles = [
  { name: "Document 1", url: "/pdfs/doc1.pdf" },
  { name: "Document 2", url: "/pdfs/doc2.pdf" },
  { name: "Document 3", url: "/pdfs/doc3.pdf" },
  { name: "Document 4", url: "/pdfs/doc4.pdf" },
  { name: "Document 5", url: "/pdfs/doc5.pdf" },
  { name: "Document 6", url: "/pdfs/doc6.pdf" },
  { name: "Document 7", url: "/pdfs/doc7.pdf" },
  { name: "Document 8", url: "/pdfs/doc8.pdf" },
  { name: "Document 9", url: "/pdfs/doc9.pdf" },
  { name: "Document 10", url: "/pdfs/doc10.pdf" },
  { name: "Document 11", url: "/pdfs/doc11.pdf" },
  { name: "Document 12", url: "/pdfs/doc12.pdf" },

];

const Documents = () => {
  return (
    <div className="documents-container">
      <h2 className="documents-title">Available PDFs</h2>
      <div className="documents-grid">
        {pdfFiles.map((pdf, index) => (
          <div key={index} className="document-card">
            <FileText className="icon" size={40} />
            <p className="document-name">{pdf.name}</p>
            <a href={pdf.url} download className="download-button">
              <Download size={20} />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
