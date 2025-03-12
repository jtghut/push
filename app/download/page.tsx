"use client"

import { Download, Users, Zap, SplitSquareHorizontal, ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Navbar from "@/components/navbar"

const updates = [
  "The LuauEditor dll has been recoded to fix every issues, improve performance & have better management.",
  "Fix LuauEditor not responding while attaching to client.",
  "Fix LuauEditor looping while attaching.",
  "Fix attaching while leaving the game.",
  "Improved script execution speed.",
  "Added new API endpoints.",
  "Updated UI components.",
  "Fixed memory leaks.",
  "Added new syntax highlighting features.",
  "Improved error handling.",
]

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Download className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">LuauEditor 1.0.0</h1>
                <p className="text-gray-400">Latest Release</p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-[#121212] border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="text-lg font-semibold text-white">Good Community</h3>
                    <p className="text-gray-400 text-sm">Join our growing community</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <SplitSquareHorizontal className="h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="text-lg font-semibold text-white">Multi Attach</h3>
                    <p className="text-gray-400 text-sm">Attach to multiple Clients at once</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Zap className="h-8 w-8 text-blue-500 mb-2" />
                    <h3 className="text-lg font-semibold text-white">Performance</h3>
                    <p className="text-gray-400 text-sm">Run scripts with high speed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                onClick={() => (window.location.href = "/login")}
              >
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </Button>
            </div>
          </div>

          {/* Updates Section */}
          <div className="lg:w-96">
            <Card className="bg-[#121212] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpCircle className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-white">Latest Updates</h2>
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {updates.map((update, index) => (
                      <Card key={index} className="bg-[#1a1a1a] border-gray-800">
                        <CardContent className="p-4">
                          <p className="text-gray-300 text-sm">{update}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

