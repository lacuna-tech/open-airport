import { TransitionEffect } from './types'

export const InstantTransition: TransitionEffect = () => {
  return {
    transitionInterpolator: undefined,
    transitionEasing: undefined,
    transitionDuration: 0
  }
}
