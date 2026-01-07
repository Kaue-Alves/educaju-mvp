"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Alternative = {
  id: string
  text: string
  isCorrect: boolean
  explanation: string
  order: number
}

type Question = {
  id: string
  content: string
  subject: string
  statement: string
  alternatives: Alternative[]
  createdAt: string
}

type Stage = "setup" | "studying" | "quiz" | "results"

export default function EducajuApp() {
  const [stage, setStage] = useState<Stage>("setup")
  const [studyTime, setStudyTime] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [questionCount, setQuestionCount] = useState<string>("10")
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [results, setResults] = useState<{ correct: number; incorrect: number } | null>(null)

  useEffect(() => {
    if (stage === "studying" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            generateQuestions()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [stage, timeLeft])

  const generateQuestions = async () => {
    setIsGeneratingQuestions(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_DEV || "http://localhost:3000"
      const url = `${baseUrl}/api/questions/generate`
      console.log("[v0] Calling API:", url)
      console.log("[v0] Request body:", {
        subject: subject,
        content: content,
        quantity: Number.parseInt(questionCount),
      })

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject,
          content: content,
          quantity: Number.parseInt(questionCount),
        }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("[v0] Expected JSON but got:", textResponse.substring(0, 200))
        throw new Error("O servidor não retornou JSON. Verifique se a URL da API está correta.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Error response:", errorData)
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Questions received:", data.length)
      setQuestions(data)
      setStage("quiz")
    } catch (error) {
      console.error("[v0] Erro ao gerar questões:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(
        `Erro ao gerar questões: ${errorMessage}\n\nVerifique:\n1. A variável NEXT_PUBLIC_BASE_URL_DEV está configurada?\n2. O backend está rodando?\n3. A rota está correta?`,
      )
      setStage("setup")
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleStartStudy = () => {
    const minutes = Number.parseInt(studyTime)
    const count = Number.parseInt(questionCount)
    if (minutes > 0 && minutes <= 120 && subject.trim() && content.trim() && count > 0 && count <= 50) {
      setTimeLeft(minutes * 60)
      setStage("studying")
    }
  }

  const handleSkipTimer = () => {
    setTimeLeft(0)
    generateQuestions()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, alternativeId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: alternativeId }))
  }

  const handleSubmit = () => {
    let correct = 0
    let incorrect = 0

    questions.forEach((question) => {
      const selectedAlternativeId = answers[question.id]
      const selectedAlternative = question.alternatives.find((alt) => alt.id === selectedAlternativeId)

      if (selectedAlternative?.isCorrect) {
        correct++
      } else {
        incorrect++
      }
    })

    setResults({ correct, incorrect })
    setStage("results")
  }

  const handleRestart = () => {
    setStage("setup")
    setStudyTime("")
    setSubject("")
    setContent("")
    setQuestionCount("10")
    setTimeLeft(0)
    setAnswers({})
    setQuestions([])
    setResults(null)
  }

  const allQuestionsAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-dark-gray border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-cream">Educaju</h1>
          <p className="text-sm text-cream/80 mt-1">Aprender junto é sempre aprender melhor</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Setup Stage */}
        {stage === "setup" && (
          <div className="max-w-lg mx-auto">
            <Card className="p-6 md:p-8 bg-white shadow-lg border-orange-primary/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-primary/10 rounded-full mb-4">
                  <svg className="w-8 h-8 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-dark-gray mb-2">Vamos começar!</h2>
                <p className="text-sm text-muted-foreground">Configure seu estudo e as questões que deseja responder</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-base font-medium text-dark-gray">
                    Matéria/Disciplina
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: História, Matemática, Geografia"
                    className="mt-2 text-lg border-orange-primary/30 focus:border-orange-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-base font-medium text-dark-gray">
                    Conteúdo
                  </Label>
                  <Input
                    id="content"
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ex: Guerra Fria, Equações do 2º grau"
                    className="mt-2 text-lg border-orange-primary/30 focus:border-orange-primary"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Tema específico que você vai estudar</p>
                </div>

                <div>
                  <Label htmlFor="question-count" className="text-base font-medium text-dark-gray">
                    Quantidade de questões
                  </Label>
                  <Input
                    id="question-count"
                    type="number"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    placeholder="Ex: 10"
                    className="mt-2 text-lg border-orange-primary/30 focus:border-orange-primary"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Entre 1 e 50 questões</p>
                </div>

                <div>
                  <Label htmlFor="study-time" className="text-base font-medium text-dark-gray">
                    Tempo de estudo (minutos)
                  </Label>
                  <Input
                    id="study-time"
                    type="number"
                    min="1"
                    max="120"
                    value={studyTime}
                    onChange={(e) => setStudyTime(e.target.value)}
                    placeholder="Ex: 30"
                    className="mt-2 text-lg border-orange-primary/30 focus:border-orange-primary"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Entre 1 e 120 minutos</p>
                </div>

                <Button
                  onClick={handleStartStudy}
                  disabled={
                    !studyTime ||
                    Number.parseInt(studyTime) <= 0 ||
                    !subject.trim() ||
                    !content.trim() ||
                    !questionCount ||
                    Number.parseInt(questionCount) <= 0
                  }
                  className="w-full bg-orange-primary hover:bg-orange-secondary text-cream font-semibold py-6 text-lg"
                  size="lg"
                >
                  Iniciar Estudo
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Studying Stage */}
        {stage === "studying" && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8 md:p-12 bg-white shadow-lg border-orange-primary/20">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-primary/10 rounded-full mb-6">
                  <svg className="w-10 h-10 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-3">Hora de estudar!</h2>
                <p className="text-lg text-muted-foreground mb-2">
                  Foque nos seus estudos. As questões aparecerão ao final do tempo.
                </p>
                <div className="inline-block bg-orange-primary/10 px-4 py-2 rounded-lg mt-2">
                  <p className="text-sm font-medium text-orange-primary">
                    {subject} - {content}
                  </p>
                </div>
              </div>

              <div className="bg-orange-primary/5 rounded-lg p-8 border-2 border-orange-primary/30">
                <div className="text-7xl md:text-8xl font-bold text-orange-primary tabular-nums">
                  {isGeneratingQuestions ? <div className="text-2xl">Gerando questões...</div> : formatTime(timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {isGeneratingQuestions ? "Aguarde um momento" : "Tempo restante"}
                </p>
              </div>

              {!isGeneratingQuestions && (
                <div className="mt-6">
                  <Button
                    onClick={handleSkipTimer}
                    variant="outline"
                    className="border-orange-primary text-orange-primary hover:bg-orange-primary/10 bg-transparent"
                  >
                    Pular cronômetro e ir para as questões
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Quiz Stage */}
        {stage === "quiz" && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 md:p-8 bg-white shadow-lg border-orange-primary/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-primary/10 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-dark-gray mb-2">Questões de {subject}</h2>
                <p className="text-muted-foreground">
                  Responda as {questions.length} {questions.length === 1 ? "questão" : "questões"} abaixo
                </p>
              </div>

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="p-5 bg-cream/50 rounded-lg border border-border">
                    <h3 className="font-semibold text-dark-gray mb-4">
                      {index + 1}. {question.statement}
                    </h3>
                    <RadioGroup
                      value={answers[question.id]}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      {question.alternatives
                        .sort((a, b) => a.order - b.order)
                        .map((alternative) => (
                          <div key={alternative.id} className="flex items-center space-x-3 mb-2">
                            <RadioGroupItem value={alternative.id} id={`q${question.id}-alt${alternative.id}`} />
                            <Label
                              htmlFor={`q${question.id}-alt${alternative.id}`}
                              className="cursor-pointer text-base"
                            >
                              {alternative.text}
                            </Label>
                          </div>
                        ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered}
                  className="w-full bg-red-primary hover:bg-red-primary/90 text-cream font-semibold py-6 text-lg"
                  size="lg"
                >
                  {allQuestionsAnswered
                    ? "Enviar Respostas"
                    : `Responda todas as questões (${Object.keys(answers).length}/${questions.length})`}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Results Stage */}
        {stage === "results" && results && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8 md:p-12 bg-white shadow-lg border-orange-primary/20">
              <div className="mb-8">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                    results.correct >= 7
                      ? "bg-green-500/10"
                      : results.correct >= 5
                        ? "bg-orange-primary/10"
                        : "bg-red-primary/10"
                  }`}
                >
                  <svg
                    className={`w-10 h-10 ${
                      results.correct >= 7
                        ? "text-green-600"
                        : results.correct >= 5
                          ? "text-orange-primary"
                          : "text-red-primary"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {results.correct >= 7 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-3">Resultado Final</h2>
                <p className="text-lg text-muted-foreground">
                  {results.correct >= 7
                    ? "Parabéns! Você foi muito bem!"
                    : results.correct >= 5
                      ? "Bom trabalho! Continue praticando!"
                      : "Continue estudando! Você vai melhorar!"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-green-500/5 rounded-lg border-2 border-green-500/30">
                  <div className="text-5xl font-bold text-green-600 mb-2">{results.correct}</div>
                  <p className="text-lg font-medium text-dark-gray">{results.correct === 1 ? "Acerto" : "Acertos"}</p>
                </div>
                <div className="p-6 bg-red-primary/5 rounded-lg border-2 border-red-primary/30">
                  <div className="text-5xl font-bold text-red-primary mb-2">{results.incorrect}</div>
                  <p className="text-lg font-medium text-dark-gray">{results.incorrect === 1 ? "Erro" : "Erros"}</p>
                </div>
              </div>

              <Button
                onClick={handleRestart}
                className="w-full bg-orange-primary hover:bg-orange-secondary text-cream font-semibold py-6 text-lg"
                size="lg"
              >
                Fazer Novo Estudo
              </Button>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-dark-gray/5 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Educaju - Estudo guiado com avaliação</p>
        </div>
      </footer>
    </div>
  )
}
