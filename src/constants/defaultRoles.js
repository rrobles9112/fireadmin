export const defaultRoles = {
  owner: {
    name: 'Owner',
    permissions: {
      read: {
        environments: true,
        members: true,
        permissions: true,
        roles: true
      },
      update: {
        environments: true,
        members: true,
        permissions: true,
        roles: true
      },
      delete: {
        environments: true,
        members: true,
        permissions: true,
        roles: true
      },
      create: {
        environments: true,
        members: true,
        permissions: true,
        roles: true
      }
    }
  },
  editor: {
    name: 'Editor',
    permissions: {
      read: { environments: true },
      update: { environments: true },
      create: { environments: true }
    }
  },
  viewer: {
    permissions: { read: { environments: true } }
  }
}

export default defaultRoles
