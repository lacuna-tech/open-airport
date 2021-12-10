import React from 'react'
import Autocomplete, { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete'
import { Checkbox, Chip, TextField } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlankOutlined'
import { FilterCard } from '../FilterCard'

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      cardContent: {
        padding: 2
      },
      underline: {
        '&:before': {
          borderBottomColor: 'transparent'
        },
        '&:after': {
          borderBottomColor: 'transparent'
        },
        '&:hover:before': {
          borderBottomColor: ['transparent', '!important']
        }
      },
      placeholder: {
        '& input': {
          paddingLeft: [theme.spacing(2), '!important']
        },
        '& input::placeholder': {
          fontSize: theme.typography.body2.fontSize
        }
      }
    }),
  { name: 'AutocompleteInput' }
)

const renderTags = ({ maxWidth, onDelete }: { maxWidth?: number; onDelete: (value: string) => () => void }) => (
  values: AutocompleteOption[],
  getTagProps: AutocompleteGetTagProps
) => {
  return values.map((option: AutocompleteOption, index: number) => (
    <Chip
      key={`chip_${option.value}`}
      {...{
        color: 'primary',
        label: option.label,
        style: { maxWidth },
        onDelete: onDelete(option.value),
        ...getTagProps({ index })
      }}
    />
  ))
}

export type AutocompleteOption = {
  label: string
  value: string
}

const getOptionLabel = (option: AutocompleteOption) => option.label

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

export interface AutocompleteInputProps {
  badgeMaxWidth?: number
  label: string
  limitTags?: number
  options: AutocompleteOption[]
  placeholder?: string
  selectedOptions?: AutocompleteOption[]
  onChange?: (updatedOptions: AutocompleteOption[]) => void
}

export const AutocompleteInput: React.FunctionComponent<AutocompleteInputProps> = ({
  badgeMaxWidth,
  label,
  limitTags,
  onChange: onChange_,
  options,
  placeholder,
  selectedOptions
}) => {
  const classes = useStyles()

  const renderOption = (option: AutocompleteOption): React.ReactNode => {
    const checked = !!selectedOptions?.find(selectedOption => selectedOption.value === option.value)

    const handleCheckEvent = (event: React.ChangeEvent, optionIsChecked: boolean) => {
      if (!optionIsChecked && selectedOptions) {
        const filteredOptions = selectedOptions.filter(o => o.value !== option.value)
        onChange_?.(filteredOptions)
      }
    }

    return (
      <React.Fragment>
        <Checkbox
          {...{
            checkedIcon,
            icon,
            checked,
            onChange: handleCheckEvent
          }}
        />
        {option.label}
      </React.Fragment>
    )
  }

  const onDeleteChip = (value: string) => () => {
    const updatedOptions = options.map(o => {
      if (o.value === value) {
        return { ...o, checked: false }
      }
      return o
    })
    onChange_?.(updatedOptions)
  }

  const onChange = (e: React.ChangeEvent<Record<string, unknown>>, checkedOptions: AutocompleteOption[]) => {
    onChange_?.(checkedOptions)
  }

  return (
    <FilterCard
      {...{
        header: label,
        classesOverride: { cardContent: classes.cardContent }
      }}
    >
      <Autocomplete
        {...{
          disableCloseOnSelect: true,
          disablePortal: true,
          getOptionLabel,
          limitTags: limitTags || 3,
          multiple: true,
          onChange,
          options,
          renderOption,
          value: selectedOptions || [],
          renderInput: params => (
            <TextField
              {...{
                ...params,
                classes: { root: classes.placeholder },
                placeholder: selectedOptions && selectedOptions.length > 0 ? undefined : placeholder,
                style: { maxHeight: 300 },
                InputProps: {
                  ...params.InputProps,
                  classes: { underline: classes.underline, root: classes.placeholder }
                }
              }}
            />
          ),
          renderTags: renderTags({
            maxWidth: badgeMaxWidth,
            onDelete: (value: string) => () => onDeleteChip(value)
          })
        }}
      />
    </FilterCard>
  )
}
