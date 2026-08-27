import { createFormHook } from '@tanstack/react-form'
import { CheckboxForm } from './CheckboxForm'
import { AsyncComboboxFieldForm } from './AsyncComboboxFieldForm'
import { ComboboxFieldForm } from './ComboboxFieldForm'
import { DatePickerForm } from './DatePickerForm'
import { FileFieldForm } from './FileFieldForm'
import { FieldArrayForm } from './FieldArrayForm'
import { FormErrorSummary } from './FormErrorSummary'
export { Form } from './Form'
export type { FormProps } from './Form'
import { NumberFieldForm } from './NumberFieldForm'
import { RadioGroupForm } from './RadioGroupForm'
import { SelectFieldForm } from './SelectFieldForm'
import { SubmitButton } from './SubmitButton'
import { TextAreaForm } from './TextAreaForm'
import { TextFieldForm } from './TextFieldForm'
import { fieldContext, formContext } from './form-context'

export { fieldContext, formContext, useFieldContext, useFormContext } from './form-context'

export const { useAppForm, useTypedAppFormContext, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextFieldForm,
    NumberFieldForm,
    TextAreaForm,
    CheckboxForm,
    DatePickerForm,
    SelectFieldForm,
    ComboboxFieldForm,
    AsyncComboboxFieldForm,
    FileFieldForm,
    FieldArrayForm,
    RadioGroupForm,
  },
  formComponents: {
    SubmitButton,
    FormErrorSummary,
  },
})
