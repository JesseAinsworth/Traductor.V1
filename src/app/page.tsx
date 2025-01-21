import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-50">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="w-48 h-48 mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura_de_pantalla_2025-01-18_012215-removebg-preview-USvKDlKPu6yFN8H1hgjytOJ0fDrJsN.png"
              alt="Logo de BrailleEase"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#87ceeb" }}>
            Bienvenido a BrailleEase
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-gray-600">Traductor Español-Braille fácil de usar</p>
          <Link href="/traductor" className="w-full">
            <Button className="w-full text-lg px-8 py-4" style={{ backgroundColor: "#87ceeb", color: "white" }}>
              Comenzar
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

