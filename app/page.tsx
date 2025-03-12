import Navbar from "@/components/navbar"
import CodeEditor from "@/components/code-editor"

export default function Home() {
  return (
    <div className="flex flex-col bg-black">
      <Navbar />
      <CodeEditor />
    </div>
  )
}

