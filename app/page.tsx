"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Question = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

const mathQuestions: Question[] = [
  { id: 1, question: "Quanto é 15 + 28?", options: ["41", "43", "42", "44"], correctAnswer: 1 },
  { id: 2, question: "Quanto é 50 - 23?", options: ["27", "26", "28", "25"], correctAnswer: 0 },
  { id: 3, question: "Quanto é 34 + 17?", options: ["50", "52", "51", "49"], correctAnswer: 2 },
  { id: 4, question: "Quanto é 82 - 45?", options: ["38", "36", "37", "39"], correctAnswer: 2 },
  { id: 5, question: "Quanto é 29 + 36?", options: ["64", "65", "66", "63"], correctAnswer: 1 },
  { id: 6, question: "Quanto é 73 - 28?", options: ["46", "44", "45", "47"], correctAnswer: 2 },
  { id: 7, question: "Quanto é 48 + 55?", options: ["102", "103", "104", "101"], correctAnswer: 1 },
  { id: 8, question: "Quanto é 91 - 37?", options: ["55", "54", "53", "56"], correctAnswer: 1 },
  { id: 9, question: "Quanto é 63 + 29?", options: ["91", "93", "92", "90"], correctAnswer: 2 },
  { id: 10, question: "Quanto é 100 - 58?", options: ["43", "41", "42", "44"], correctAnswer: 2 },
]

type Stage = "setup" | "studying" | "quiz" | "results"

export default function EducajuApp() {
  const [stage, setStage] = useState<Stage>("setup")
  const [studyTime, setStudyTime] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [results, setResults] = useState<{ correct: number; incorrect: number } | null>(null)

  useEffect(() => {
    if (stage === "studying" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStage("quiz")
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [stage, timeLeft])

  const handleStartStudy = () => {
    const minutes = Number.parseInt(studyTime)
    if (minutes > 0 && minutes <= 120) {
      setTimeLeft(minutes * 60)
      setStage("studying")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmit = () => {
    let correct = 0
    let incorrect = 0

    mathQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
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
    setTimeLeft(0)
    setAnswers({})
    setResults(null)
  }

  const allQuestionsAnswered = mathQuestions.every((q) => answers[q.id] !== undefined)

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
                <p className="text-muted-foreground">
                  Defina quanto tempo você quer estudar antes de fazer as questões
                </p>
              </div>

              <div className="space-y-4">
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
                  disabled={!studyTime || Number.parseInt(studyTime) <= 0}
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
                <p className="text-lg text-muted-foreground">
                  Foque nos seus estudos. As questões aparecerão ao final do tempo.
                </p>
              </div>

              <div className="bg-orange-primary/5 rounded-lg p-8 border-2 border-orange-primary/30">
                <div className="text-7xl md:text-8xl font-bold text-orange-primary tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground mt-4">Tempo restante</p>
              </div>
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
                <h2 className="text-2xl md:text-3xl font-bold text-dark-gray mb-2">Questões de Matemática</h2>
                <p className="text-muted-foreground">Responda as 10 questões abaixo</p>
              </div>

              <div className="space-y-6">
                {mathQuestions.map((question, index) => (
                  <div key={question.id} className="p-5 bg-cream/50 rounded-lg border border-border">
                    <h3 className="font-semibold text-dark-gray mb-4">
                      {index + 1}. {question.question}
                    </h3>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3 mb-2">
                          <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}-opt${optionIndex}`} />
                          <Label htmlFor={`q${question.id}-opt${optionIndex}`} className="cursor-pointer text-base">
                            {option}
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
                    : `Responda todas as questões (${Object.keys(answers).length}/10)`}
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
          <p className="text-sm text-muted-foreground">© 2025 Educaju - Aprender junto é sempre aprender melhor</p>
        </div>
      </footer>
    </div>
  )
}
