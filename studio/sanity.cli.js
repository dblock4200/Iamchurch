import {defineCliConfig} from 'sanity/cli'

// The project id is filled in once the Sanity project exists.
// See studio/README.md for the one-time setup.
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'xhz48loo',
    dataset: 'production',
  },
  studioHost: 'iamchurch',
})
