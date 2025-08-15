"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Loader2, BarChart3, Video } from "lucide-react"
import BadmintonScoreboard from "@/components/scoreboard"

export default function FileAnalyzer() {
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const videoRef = useRef(null);
const streamRef = useRef(null);
const [webcamActive, setWebcamActive] = useState(false);

const toggleWebcam = async () => {
  if (webcamActive) {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  }
};


  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault() 
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setAnalysis("")
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files && e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setAnalysis("")
    }
  }

  const analyzeFile = async () => {
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysis(result.analysis)
    } catch (error) {
      console.error("Error analyzing file:", error)
      setAnalysis("Error: Failed to analyze file. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/50" />

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 pt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Badminton Game Analyzer 🏸
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload any file and get instant, comprehensive analysis powered by Python
            </p>
          </div>
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-5 w-5 text-primary" />
                Upload File
              </CardTitle>
              <CardDescription className="text-base">
                Drag and drop a file or click to browse. Supports text, CSV, JSON, code files, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-accent/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Label
                      htmlFor="file"
                      className="text-base font-medium cursor-pointer hover:text-primary transition-colors"
                    >
                      Choose a file or drag it here
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Maximum file size: 10MB</p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.csv,.json,.md,.py,.js,.html,.css,.xml,.log"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border border-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={analyzeFile}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze File
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="h-5 w-5 text-primary" />
                Use Webcam
              </CardTitle>
              <CardDescription className="text-base">
                Capture live video from your webcam for instant analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="relative rounded-xl overflow-hidden border border-border/50">
  {webcamActive ? (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full aspect-video object-cover"
    />
  ) : (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <Video className="h-8 w-8 mb-3 text-primary" />
      <p>No webcam feed yet</p>
    </div>
  )}
</div>
<div className="flex justify-center">
  <Button
  onClick={toggleWebcam}
  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
>
  {webcamActive ? "Stop Webcam" : "Start Webcam"}
</Button>
</div>

</CardContent>
</Card>
</div>

         

          {analysis && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Analysis Results
                </CardTitle>
                <CardDescription>Comprehensive analysis of your file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={analysis}
                    readOnly
                    className="min-h-[400px] font-mono text-sm bg-background/50 border-border/50 resize-none"
                    placeholder="Analysis results will appear here..."
                  />
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card/80 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="p-6">
        <BadmintonScoreboard /> 
        </div>
        
      </div>
      
    </div>
  )
}
