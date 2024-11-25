'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Camera, Upload, Printer, RotateCcw } from 'lucide-react'

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
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h1 { color: #3b82f6; }
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-600">Traductor Español-Braille</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleSwitch} variant="outline">
              {isSpanishToBraille ? 'Cambiar a Braille → Español' : 'Cambiar a Español → Braille'}
            </Button>
          </div>
          <div>
            <Label htmlFor="input">{isSpanishToBraille ? 'Texto en Español:' : 'Texto en Braille:'}</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isSpanishToBraille ? "Ingrese texto en español..." : "Ingrese texto en braille..."}
              className="mt-1"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => fileInputRef.current?.click()} className="flex-1">
              <Upload className="mr-2 h-4 w-4" /> Subir Imagen
            </Button>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button onClick={handleTakePhoto} className="flex-1">
              <Camera className="mr-2 h-4 w-4" /> Tomar Foto
            </Button>
          </div>
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Vista previa" className="max-w-full h-auto" />
            </div>
          )}
          <video ref={videoRef} className="hidden" />
          {videoRef.current?.srcObject && (
            <Button onClick={capturePhoto}>Capturar Foto</Button>
          )}
          <Button onClick={handleTranslate} className="w-full">Traducir</Button>
          <div>
            <Label htmlFor="output">{isSpanishToBraille ? 'Traducción a Braille:' : 'Traducción a Español:'}</Label>
            <Textarea
              id="output"
              value={output}
              readOnly
              className="mt-1 bg-gray-50"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Historial de Traducciones</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {translations.map((translation, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">{translation.date}</p>
                    <p><strong>{translation.isSpanishToBraille ? 'Español:' : 'Braille:'}</strong> {translation.input}</p>
                    <p><strong>{translation.isSpanishToBraille ? 'Braille:' : 'Español:'}</strong> {translation.output}</p>
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