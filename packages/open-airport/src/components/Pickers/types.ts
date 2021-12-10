import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { DateTime } from 'luxon'

export type PickersProps = {
  endDateTime: MaterialUiPickersDate
  error: boolean
  minDate: DateTime
  setEndDateTime: React.Dispatch<React.SetStateAction<MaterialUiPickersDate>>
  setStartDateTime: React.Dispatch<React.SetStateAction<MaterialUiPickersDate>>
  startDateTime: MaterialUiPickersDate
  errorMessage?: string
  minuteStep?: number
  useLive?: boolean
}
