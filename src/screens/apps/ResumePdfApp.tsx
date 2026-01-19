export default function ResumePdfApp() {
  return (
    <div className="pdf">
      {/* Put your PDF at /public/resume.pdf */}
      <iframe className="pdfFrame" title="Resume" src="/ChrisOllenburg-Resume-2025.pdf" />
    </div>
  )
}
