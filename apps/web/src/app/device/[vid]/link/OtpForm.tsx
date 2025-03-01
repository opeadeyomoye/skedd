'use client'

import { FormEvent, useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/input-otp'
import { Button } from '@/components/button'
import useFetch from '@/hooks/useFetch'

const apiRoot = process.env.NEXT_PUBLIC_API_ROOT

type Props = {
  vid: string
}

export default async function OtpForm({ vid }: Props) {
  const appFetch = await useFetch()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await appFetch(`${apiRoot}/whatsapp-verifications/${vid}`, {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ code: value })
      })
      if (res.ok) {
        return //redirect
      }
      setError('That didn\'t work. Please check the code and try again.')
    }
    catch {
      return setError('Something went wrong. Please try again.')
    }
  }
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  return <>
    <form onSubmit={onSubmit} method="post" className="mt-10">
      <div className="">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(value) => setValue(value.trim().toUpperCase())}
          required={true}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
            <InputOTPSlot index={1} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
            <InputOTPSlot index={2} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
            <InputOTPSlot index={3} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
            <InputOTPSlot index={4} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
            <InputOTPSlot index={5} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="mt-12">
        <Button color="dark/white" type="submit" className="min-w-28 md:text-base">
          Submit
        </Button>
      </div>

      {error.length ? (
        <div className="mt-6 border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-950">
          <div className="flex">
            <div className="shrink-0">
              <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400 dark:text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                {error}
              </p>
            </div>
          </div>
        </div>
      ): null}
    </form>
  </>
}
