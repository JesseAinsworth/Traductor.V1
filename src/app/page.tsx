'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Camera, Upload, Printer, RotateCcw, Menu, Trash2, Delete } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const brailleToSpanish: { [key: string]: string } = {
  '⠁': 'a', '⠃': 'b', '⠉': 'c', '⠙': 'd', '⠑': 'e',
  '⠋': 'f', '⠛': 'g', '⠓': 'h', '⠊': 'i', '⠚': 'j',
  '⠅': 'k', '⠇': 'l', '⠍': 'm', '⠝': 'n', '⠕': 'o',
  '⠏': 'p', '⠟': 'q', '⠗': 'r', '⠎': 's', '⠞': 't',
  '⠥': 'u', '⠧': 'v', '⠺': 'w', '⠭': 'x', '⠽': 'y',
  '⠵': 'z', '⠀': ' '
}

const spanishToBraille: { [key: string]: string } = Object.fromEntries(
  Object.entries(brailleToSpanish).map(([k, v]) => [v, k])
)

const spanishKeys = 'abcdefghijklmnñopqrstuvwxyz'.split('')
const brailleKeys = Object.keys(brailleToSpanish)

interface Translation {
  input: string;
  output: string;
  date: string;
  isSpanishToBraille: boolean;
}

export default function Home() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isSpanishToBraille, setIsSpanishToBraille] = useState(true)
  const [translations, setTranslations] = useState<Translation[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const savedTranslations = localStorage.getItem('translations')
    if (savedTranslations) {
      setTranslations(JSON.parse(savedTranslations))
    }
  }, [])

  const handleTranslate = () => {
    const translation = input.split('').map(char => {
      const lowerChar = char.toLowerCase()
      return isSpanishToBraille
        ? spanishToBraille[lowerChar] || char
        : brailleToSpanish[char] || char
    }).join('')
    setOutput(translation)

    const newTranslation: Translation = {
      input,
      output: translation,
      date: new Date().toLocaleString(),
      isSpanishToBraille
    }
    const updatedTranslations = [newTranslation, ...translations.slice(0, 9)]
    setTranslations(updatedTranslations)
    localStorage.setItem('translations', JSON.stringify(updatedTranslations))
  }

  const handleSwitch = () => {
    setIsSpanishToBraille(!isSpanishToBraille)
    setInput('')
    setOutput('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      setImagePreview(canvas.toDataURL('image/jpeg'))
      if (videoRef.current.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Traducción de Braille</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e3a8a; }
              h1 { color: #b5caf8; }
              .container { margin: 20px; }
              .text-block { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Traducción de Braille</h1>
              <div class="text-block">
                <h2>${isSpanishToBraille ? 'Texto Original (Español):' : 'Texto Original (Braille):'}</h2>
                <p>${input}</p>
              </div>
              <div class="text-block">
                <h2>${isSpanishToBraille ? 'Traducción (Braille):' : 'Traducción (Español):'}</h2>
                <p>${output}</p>
              </div>
              ${imagePreview ? `<img src="${imagePreview}" alt="Imagen subida o capturada" style="max-width: 100%; height: auto;">` : ''}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleKeyPress = (key: string) => {
    setInput(prev => prev + key)
  }

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1))
  }

  const clearHistory = () => {
    setTranslations([])
    localStorage.removeItem('translations')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-2 sm:p-4 md:p-6 bg-blue-50">
      <Card className="w-full max-w-[95%] sm:max-w-md lg:max-w-lg bg-white shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 bg-white rounded-t-lg relative">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 md:gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura_de_pantalla_2025-01-18_012215-removebg-preview-USvKDlKPu6yFN8H1hgjytOJ0fDrJsN.png"
                alt="BrailleEase Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center sm:text-left mt-2 sm:mt-0"
              style={{ color: "#87ceeb" }}
            >
              Traductor Español-Braille
            </CardTitle>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 sm:static sm:top-0 sm:right-0 text-white hover:bg-blue-700"
              >
                <Menu className="h-6 w-6" style={{ color: "#87ceeb" }} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle style={{ color: "#87ceeb" }}>Opciones</SheetTitle>
                <SheetDescription style={{ color: "#87ceeb" }}>
                  Configura la aplicación y accede a funciones adicionales.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <Button
                  onClick={handleSwitch}
                  variant="outline"
                  className="w-full"
                  style={{ color: "#87ceeb", borderColor: "#87ceeb" }}
                >
                  {isSpanishToBraille
                    ? "Cambiar a Braille → Español"
                    : "Cambiar a Español → Braille"}
                </Button>
                <Button
                  onClick={handlePrint}
                  className="w-full"
                  style={{ backgroundColor: "#87ceeb", color: "white" }}
                >
                  <Printer className="mr-2 h-4 w-4" /> Imprimir
                </Button>
                <Button
                  onClick={clearHistory}
                  variant="destructive"
                  className="w-full"
                  style={{ color: "#87ceeb" }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Limpiar Historial
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="input" className="text-blue-600" style={{ color: '#87ceeb' }}>
              {isSpanishToBraille ? 'Texto en Español:' : 'Texto en Braille:'}
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isSpanishToBraille ? "Ingrese texto en español..." : "Ingrese texto en braille..."}
              className="mt-1 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-2">
            {(isSpanishToBraille ? spanishKeys : brailleKeys).map((key) => (
              <Button
                key={key}
                variant="outline"
                className="p-1 sm:p-2 text-center border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                style={{ color: '#87ceeb', borderColor: '#87ceeb' }}
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </Button>
            ))}
            <Button
              variant="outline"
              className="p-1 sm:p-2 text-center border-blue-200 hover:bg-blue-50 col-span-2 sm:col-span-1 text-xs sm:text-sm"
              style={{ color: '#87ceeb', borderColor: '#87ceeb' }}
              onClick={handleBackspace}
            >
              <Delete className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={() => fileInputRef.current?.click()} className="flex-1" style={{ backgroundColor: '#87ceeb', color: 'white' }}>
              <Upload className="mr-2 h-4 w-4" /> Subir Imagen
            </Button>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button onClick={handleTakePhoto} className="flex-1" style={{ backgroundColor: '#87ceeb', color: 'white' }}>
              <Camera className="mr-2 h-4 w-4" /> Tomar Foto
            </Button>
          </div>
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview || "/placeholder.svg"} alt="Vista previa" className="max-w-full h-auto rounded-lg border border-blue-200" />
            </div>
          )}
          <video ref={videoRef} className="hidden" />
          {videoRef.current?.srcObject && (
            <Button onClick={capturePhoto} className="w-full" style={{ backgroundColor: '#87ceeb', color: 'white' }}>
              Capturar Foto
            </Button>
          )}
          <Button onClick={handleTranslate} className="w-full" style={{ backgroundColor: '#87ceeb', color: 'white' }}>
            Traducir
          </Button>
          <div>
            <Label htmlFor="output" className="text-blue-600" style={{ color: '#87ceeb' }}>
              {isSpanishToBraille ? 'Traducción a Braille:' : 'Traducción a Español:'}
            </Label>
            <Textarea
              id="output"
              value={output}
              readOnly
              className="mt-1 bg-blue-50 border-blue-200"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#87ceeb' }}>Historial de Traducciones</h3>
            <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
              {translations.map((translation, index) => (
                <Card key={index} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm" style={{ color: '#87ceeb' }}>{translation.date}</p>
                    <p><strong style={{ color: '#87ceeb' }}>{translation.isSpanishToBraille ? 'Español:' : 'Braille:'}</strong> {translation.input}</p>
                    <p><strong style={{ color: '#87ceeb' }}>{translation.isSpanishToBraille ? 'Braille:' : 'Español:'}</strong> {translation.output}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

