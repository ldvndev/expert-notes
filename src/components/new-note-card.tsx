import * as Dialog from '@radix-ui/react-dialog'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ChevronLeft, X } from 'lucide-react'

import { useState } from 'react'

const newNoteSchema = zod.object({
  content: zod.string(),
})

type NewNoteSchema = zod.infer<typeof newNoteSchema>

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)

  const { handleSubmit, register, reset } = useForm<NewNoteSchema>({
    resolver: zodResolver(newNoteSchema),
  })

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleShowOnboarding() {
    setShouldShowOnboarding(true)
  }

  function handleSaveNote(data: NewNoteSchema) {
    onNoteCreated(data.content)
    setShouldShowOnboarding(true)
    reset()

    toast.success('Nota criada com sucesso! ')
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
                  <button className="font-medium text-lime-400 hover:underline">
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button
                    onClick={handleStartEditor}
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

            <button
              type="submit"
              className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
            >
              Salvar nota
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
