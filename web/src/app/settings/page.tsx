'use client'

import DetailViewPage from '@/components/mobile/DetailViewPage'

export default function SettingsPage() {
  return (
    <DetailViewPage
      title="Settings"
      subtitle="Configure your GhostQuant experience"
      icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
    >
      <div className="space-y-6">
        <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
          <p className="text-gray-400">
            Settings and preferences will be added in Phase 2. This page will include:
          </p>
          <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
            <li>Notification preferences</li>
            <li>Alert thresholds and filters</li>
            <li>Display and theme options</li>
            <li>API key management</li>
            <li>Account settings</li>
          </ul>
        </div>
      </div>
    </DetailViewPage>
  )
}
