import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/input-otp'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { auth } from '@clerk/nextjs/server'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/button'

const apiRoot = process.env.NEXT_PUBLIC_API_ROOT
const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export default async function LinkPage({ params }: { params: Promise<{ vid: string }> }) {
  /**
   * use user auth to fetch verification details
   * pass false if the schtick is invalid
   * pass phoneMask if it's valid
   */
  const token = await (await auth()).getToken()
  if (!token) return

  const { vid } = await params
  let deets
  try {
    deets = await fetch(`${apiRoot}/whatsapp-verifications/${vid}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }
  catch {
    return // something went wrong. try again
  }

  if (deets.status !== 200) {
    return <InvalidLinkComponent />
  }

  return <>
    <div className="w-full max-w-md mx-auto">

      <div>
        <Heading>Link your WhatsApp number ending in {9843}</Heading>
        <Text className="mt-6 text-">
          Please enter the code contained in the WhatsApp message we sent to you at
          {' '}
          *********{'9843'}.
        </Text>

        <div className="mt-12 flex justify-center">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" index={0} />
              <InputOTPSlot className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" index={1} />
              <InputOTPSlot className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" index={2} />
            </InputOTPGroup>
            <InputOTPSeparator className="w-4 text-zinc-600" />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
              <InputOTPSlot index={4} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
              <InputOTPSlot index={5} className="h-12 w-12 border-y-2 border-r-2 border-zinc-600 text-2xl first:border-l-2" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
    </div>
  </>
}

function InvalidLinkComponent() {
  return <>
    <div className="w-full max-w-md mx-auto">
      <Heading className="text-center">That link is invalid or has expired</Heading>

      <div className="mt-12 flex justify-center">
        <ExclamationTriangleIcon className="w-24 h-auto text-zinc-800" />
      </div>

      <div className="mt-10">
        <Button href={`https://wa.me/${waNumber}?text=Hi!`} className="w-full">
          Get a new one
        </Button>
      </div>
    </div>
  </>
}
