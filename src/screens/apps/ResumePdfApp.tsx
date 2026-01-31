export default function ResumePdfApp() {
  const pdfUrl = `${import.meta.env.BASE_URL}ChrisOllenburg-Resume-2025.pdf`
  return (
    <div className="pdf">
      {/* Put your PDF at /public/resume.pdf */}
      <iframe className="pdfFrame" title="Resume" src={pdfUrl} />
    </div>
  )
}
