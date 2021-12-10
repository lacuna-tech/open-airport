import {
  BIRD_PROVIDER_ID,
  BLUE_LA_PROVIDER_ID,
  BLUE_SYSTEMS_PROVIDER_ID,
  BOLT_PROVIDER_ID,
  CIRC_PROVIDER_ID,
  CLEVR_PROVIDER_ID,
  CLOUD_PROVIDER_ID,
  HOPR_PROVIDER_ID,
  JUMP_PROVIDER_ID,
  LADOT_PROVIDER_ID,
  LIME_PROVIDER_ID,
  LYFT_PROVIDER_ID,
  OJO_ELECTRIC_PROVIDER_ID,
  RAZOR_PROVIDER_ID,
  SHERPA_LA_PROVIDER_ID,
  SKIP_PROVIDER_ID,
  SPIN_PROVIDER_ID,
  TEST1_PROVIDER_ID,
  TEST2_PROVIDER_ID,
  TIER_PROVIDER_ID,
  WHEELS_PROVIDER_ID,
  WIND_PROVIDER_ID,
  SUPERPEDESTRIAN_PROVIDER_ID
} from '@mds-core/mds-providers'

export const unknownProviderColor = 'green'

export function colorForProvider(providerId: string): string {
  switch (providerId) {
    case JUMP_PROVIDER_ID: // really this is uber
      return '#121212'
    case LIME_PROVIDER_ID:
      return '#24d000'
    case BIRD_PROVIDER_ID:
      return '#333333'
    case RAZOR_PROVIDER_ID:
      return '#ee2d15'
    case LYFT_PROVIDER_ID:
      return '#ff00bf'
    case SKIP_PROVIDER_ID:
      return '#f7c80a' // or blue #1c95d3
    case HOPR_PROVIDER_ID:
      return '#42deea'
    case WHEELS_PROVIDER_ID:
      return '#900a48' // lots of options here
    case SPIN_PROVIDER_ID:
      return '#ff5436'
    case WIND_PROVIDER_ID:
      return '#fffa00'
    case TIER_PROVIDER_ID:
      return '#69d2aa' // or #001c6e
    case CLOUD_PROVIDER_ID:
      return '#4c7cf3'
    case BLUE_LA_PROVIDER_ID:
      return '#0D929D'
    case BOLT_PROVIDER_ID:
      return '#ffe600'
    case CLEVR_PROVIDER_ID:
      return '#1470af'
    case SHERPA_LA_PROVIDER_ID:
      return 'green'
    case OJO_ELECTRIC_PROVIDER_ID:
      return '#ac0e26'
    case SUPERPEDESTRIAN_PROVIDER_ID:
      return '#E5FF00'
    case CIRC_PROVIDER_ID:
      return '#fa6e4b'
    case LADOT_PROVIDER_ID:
      return '#0f2940'
    case BLUE_SYSTEMS_PROVIDER_ID:
      return '#192233'
    case TEST1_PROVIDER_ID:
    case TEST2_PROVIDER_ID:
    default:
      return unknownProviderColor
    // case LA_YELLOW_CAB_PROVIDER_ID:
    //   return 'red'
  }
}
