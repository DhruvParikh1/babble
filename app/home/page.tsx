"use client"

import BubbleVoiceRecorder from '@/components/BubbleVoiceRecorder'

export default function HomePage() {
  const handleRecordingStart = () => {
    console.log('Recording started!')
    // Add your recording logic here
  }

  const handleRecordingComplete = () => {
    console.log('Recording completed!')
    // Handle recording completion
  }

  const handleProcessingStart = () => {
    console.log('Processing started!')
    // Handle processing start
  }

  const handleProcessingComplete = () => {
    console.log('Processing completed!')
    // Handle processing completion
  }

  return (
    <div>
      <BubbleVoiceRecorder
        onRecordingStart={handleRecordingStart}
        onRecordingComplete={handleRecordingComplete}
        onProcessingStart={handleProcessingStart}
        onProcessingComplete={handleProcessingComplete}
        className="custom-bubble-styles" // optional custom styling
      />
    </div>
  )
}