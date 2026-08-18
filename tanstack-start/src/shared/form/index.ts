import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { CheckboxForm } from './CheckboxForm'
import { ComboboxFieldForm } from './ComboboxFieldForm'
import { DatePickerForm } from './DatePickerForm'
import { FileFieldForm } from './FileFieldForm'
import { RadioGroupForm } from './RadioGroupForm'
import { SelectFieldForm } from './SelectFieldForm'
import { SubmitButton } from './SubmitButton'
import { TextAreaForm } from './TextAreaForm'
import { TextFieldForm } from './TextFieldForm'

export const { formContext, fieldContext, useFormContext, useFieldContext } =
  createFormHookContexts()

export const { useAppForm, useTypedAppFormContext, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextFieldForm,
    TextAreaForm,
    CheckboxForm,
    DatePickerForm,
    SelectFieldForm,
    ComboboxFieldForm,
    FileFieldForm,
    RadioGroupForm,
  },
  formComponents: {
    SubmitButton,
  },
})
