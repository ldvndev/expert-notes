import * as Dialog from '@radix-ui/react-dialog'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ChevronLeft, X } from 'lucide-react'

import { useState } from 'react'

const newNoteCardSchema = zod.object({
  content: zod.string(),
})

type NewNoteCardSchema = zod.infer<typeof newNoteCardSchema>

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const { handleSubmit, register, reset, setValue } =
    useForm<NewNoteCardSchema>({
      resolver: zodResolver(newNoteCardSchema),
    })

  let speechRecognition: SpeechRecognition | null = null

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleShowOnboarding() {
    setShouldShowOnboarding(true)
  }

  function handleSaveNote(data: NewNoteCardSchema) {
    if (data.content === '') {
      return
    }

    onNoteCreated(data.content)
    setShouldShowOnboarding(true)
    reset()

    toast.success('Nota criada com sucesso! ')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação!')
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setValue('content', transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)

    if (speechRecognition !== null) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col text-left bg-slate-700 p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave um nota em audio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed overflow-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full h-[60vh] bg-slate-700 rounded-b-md flex flex-col outline-none">
          <Dialog.Close className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </Dialog.Close>

          <form
            onSubmit={handleSubmit(handleSaveNote)}
            className="flex-1 flex flex-col"
          >
            <div className="flex flex-1 flex-col gap-3 p-5">
              {!shouldShowOnboarding && (
                <button
                  onClick={handleShowOnboarding}
                  type="button"
                  className="absolute top-0 left-0 p-1.5 text-slate-400 hover:text-slate-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <span className="text-sm mt-5 font-medium text-slate-200">
                Adicionar nota
              </span>

              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{' '}
                  <button
                    onClick={handleStartRecording}
                    type="button"
                    className="font-medium text-lime-400 hover:underline"
                  >
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button
                    onClick={handleStartEditor}
                    type="button"
                    className="font-medium text-lime-400 hover:underline"
                  >
                    utilize apenas texto
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none  "
                  {...register('content')}
                />
              )}
            </div>

            {isRecording ? (
              <button
                // type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
              >
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button
                type="submit"
                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
