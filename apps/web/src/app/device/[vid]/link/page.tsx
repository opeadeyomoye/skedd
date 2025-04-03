import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { auth } from '@clerk/nextjs/server'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/button'
import OtpForm from './OtpForm'
import apiFetch from '@/apiFetch'

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
    deets = await apiFetch(token).get(`/whatsapp-verifications/${vid}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }
  catch {
    return // something went wrong. try again
  }

  if (deets.status !== 200) {
    return <InvalidLinkComponent />
  }
  const { phoneMask } = await deets.json()

  return <>
    <div className="w-full max-w-md mx-auto">
      <div>
        <Heading>Link your WhatsApp number ending in {phoneMask}</Heading>
        <Text className="mt-6">
          Please enter the code in the WhatsApp message we sent to you at
          {' '}
          *********{phoneMask}.
        </Text>

        <OtpForm vid={vid} token={token} />
      </div>
    </div>
  </>
}

function InvalidLinkComponent() {
  return <>
    <div className="w-full max-w-md mx-auto">
      <div className="mt-12 flex justify-center">
        <ExclamationTriangleIcon className="w-24 h-auto text-zinc-700" />
      </div>

      <Heading className="mt-8 text-center">That link is invalid or has expired</Heading>

      <div className="mt-10">
        <Button href={`https://wa.me/${waNumber}?text=Hi!`} className="w-full text-base">
          Get a new one
        </Button>
      </div>
    </div>
  </>
}
