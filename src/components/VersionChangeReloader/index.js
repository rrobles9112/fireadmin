import { useEffect } from 'react'
import { useDatabase, useDatabaseObjectData } from 'reactfire'

export default function VersionChangeReloader() {
  const database = useDatabase()
  const versionInfo = useDatabaseObjectData(database.ref('versionInfo'))

  const sessionStorageKey = 'fireadminVersion'

  useEffect(() => {
    const currentRemoteVersion = versionInfo.current
    const currentClientVersion = window.version
    const sessionVersion = window.sessionStorage.getItem(sessionStorageKey)
    // set version to session storage if it does not exist
    if (!sessionVersion) {
      window.sessionStorage.setItem(sessionStorageKey, currentRemoteVersion)
      // Exit since the client does not have a version in session storage
      return
    }

    // Exit if there is no current remote version
    if (!currentRemoteVersion) {
      return
    }

    // Check if version in Database matches client's session version
    const versionDiscrepencyExists =
      currentRemoteVersion !== currentClientVersion

    // Previous refresh or version set to state has happened
    const refreshHasOccurred = currentRemoteVersion === sessionVersion

    // Refresh if session contains different version than database
    if (
      versionDiscrepencyExists &&
      !refreshHasOccurred &&
      // refresh not enabled locally since DB update happens in deploy
      !window.location.host.includes('localhost')
    ) {
      window.location.reload(true)
    }
  }, [versionInfo])

  return null
}
