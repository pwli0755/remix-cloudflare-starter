import type { ActionFunctionArgs } from '@remix-run/node';
import { CheckboxConform } from '~/components/conform/Checkbox';
import { CheckboxGroupConform } from '~/components/conform/CheckboxGroup';
import { CountryPickerConform } from '~/components/conform/CountryPicker';
import { DatePickerConform } from '~/components/conform/DatePicker';
import { Field, FieldError } from '~/components/conform/Field';
import { InputConform } from '~/components/conform/Input';
import { InputOTPConform } from '~/components/conform/InputOTP';
import { RadioGroupConform } from '~/components/conform/RadioGroup';
import { SelectConform } from '~/components/conform/Select';
import { SliderConform } from '~/components/conform/Slider';
import { SwitchConform } from '~/components/conform/Switch';
import { TextareaConform } from '~/components/conform/Textarea';
import { ToggleGroupConform } from '~/components/conform/ToggleGroup';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { getFormProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import {
	Form,
	json,
	redirect,
	useActionData,
	useNavigation,
} from '@remix-run/react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { user } from '~/db.server/schema';

const UserSubscriptionSchema = z.object({
	name: z
		.string({ required_error: 'Name is required' })
		.min(3, { message: 'Name must be at least 3 characters long' }),
	dateOfBirth: z
		.date({
			required_error: 'Date of birth is required',
			invalid_type_error: 'Invalid date',
		})
		.max(new Date(), { message: 'Date of birth cannot be in the future' }),
	country: z.string({ required_error: 'Country is required' }),
	gender: z.enum(['male', 'female', 'other'], {
		required_error: 'Gender is required',
	}),
	agreeToTerms: z.boolean({ required_error: 'You must agree to the terms' }),
	job: z.enum(['developer', 'designer', 'manager'], {
		required_error: 'You must select a job',
	}),
	age: z.number().min(18, 'You must have be more than 18'),
	isAdult: z
		.boolean()
		.optional()
		.refine(val => val == true, 'You must be an adult'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	accountType: z.enum(['personal', 'business'], {
		required_error: 'You must select an account type',
	}),
	interests: z
		.array(z.string())
		.min(3, 'You must select at least three interest'),
	code: z.string().length(6, 'Code must be 6 characters long'),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const formData = await request.formData();
	console.log('========================>', formData);
	const result = parseWithZod(formData, { schema: UserSubscriptionSchema });
	console.log('========================>', result);
	if (result.status !== 'success') {
		return json(result.reply());
	}

	const u = await context.env.DB.insert(user)
		.values({
			fullName: result.value.name,
			email: result.value.country,
			displayName: result.value.name,
		})
		.returning();

	console.log('user saved: ++++++++++ ', u);
	return json({ ...result.reply(), user: u });
	if (formData.get('name') === '11111') {
		return json({ ...result.reply(), code: 0 });
	}

	return redirect('.');
};

export default function App() {
	// Last submission returned by the server
	const lastResult = useActionData<typeof action>();
	console.log('+++++++++++++++++', lastResult);
	const navigation = useNavigation();

	const [form, fields] = useForm({
		// Sync the result of last submission
		lastResult: navigation.state === 'idle' ? lastResult : null,
		id: 'signup',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: UserSubscriptionSchema });
		},
		// onSubmit(e) {
		// 	e.preventDefault()
		// 	const form = e.currentTarget
		// 	const formData = new FormData(form)
		// 	const result = parseWithZod(formData, { schema: UserSubscriptionSchema })
		// 	alert(JSON.stringify(result, null, 2))
		// },
		shouldRevalidate: 'onInput',
	});
	useEffect(() => {
		if (
			navigation.state === 'idle' &&
			lastResult &&
			(lastResult as { code?: number }).code === 0
		) {
			toast.success('Form submitted successfully!', {
				duration: 5000,
			});
		}
	}, [navigation, lastResult]);
	return (
		<div className="flex flex-col gap-6 p-10">
			<h1 className="text-2xl">Shadcn + Conform example</h1>
			<Form
				method="POST"
				{...getFormProps(form)}
				className="flex flex-col items-start gap-4"
			>
				<Field>
					<Label htmlFor={fields.name.id}>Name</Label>
					<InputConform meta={fields.name} type="text" />
					{fields.name.errors && <FieldError>{fields.name.errors}</FieldError>}
				</Field>
				<Field>
					<Label htmlFor={fields.dateOfBirth.id}>Birth date</Label>
					<DatePickerConform meta={fields.dateOfBirth} />
					{fields.dateOfBirth.errors && (
						<FieldError>{fields.dateOfBirth.errors}</FieldError>
					)}
				</Field>
				<Field>
					<Label htmlFor={fields.country.id}>Country</Label>
					<CountryPickerConform meta={fields.country} />
					{fields.country.errors && (
						<FieldError>{fields.country.errors}</FieldError>
					)}
				</Field>
				<Field>
					<Label htmlFor={fields.gender.id}>Gender</Label>
					<RadioGroupConform
						meta={fields.gender}
						items={[
							{ value: 'male', label: 'male' },
							{ value: 'female', label: 'female' },
							{ value: 'other', label: 'other' },
						]}
					/>
					{fields.gender.errors && (
						<FieldError>{fields.gender.errors}</FieldError>
					)}
				</Field>
				<Field>
					<div className="flex items-center gap-2">
						<CheckboxConform meta={fields.agreeToTerms} />
						<Label htmlFor={fields.agreeToTerms.id}>Agree to terms</Label>
					</div>
					{fields.agreeToTerms.errors && (
						<FieldError>{fields.agreeToTerms.errors}</FieldError>
					)}
				</Field>
				<Field>
					<Label htmlFor={fields.job.id}>Job</Label>
					<SelectConform
						placeholder="Select a job"
						meta={fields.job}
						items={[
							{ value: 'developer', name: 'Developer' },
							{ value: 'designer', name: 'Design' },
							{ value: 'manager', name: 'Manager' },
							{ value: 'manager1', name: 'Manager1' },
							{ value: 'manager2', name: 'Manager2' },
							{ value: 'manager3', name: 'Manager3' },
							{ value: 'manager4', name: 'Manager4' },
							{ value: 'manager5', name: 'Manager5' },
							{ value: 'manager6', name: 'Manager6' },
							{ value: 'manager7', name: 'Manager7' },
							{ value: 'manager8', name: 'Manager8' },
							{ value: 'manager9', name: 'Manager9' },
							{ value: 'manager10', name: 'Manager10' },
							{ value: 'manager11', name: 'Manager11' },
							{ value: 'manager12', name: 'Manager12' },
							{ value: 'manager13', name: 'Manager13' },
							{ value: 'manager14', name: 'Manager14' },
							{ value: 'manager15', name: 'Manager15' },
							{ value: 'manager16', name: 'Manager16' },
							{ value: 'manager17', name: 'Manager17' },
							{ value: 'manager189999999', name: 'manager189999999' },
						]}
					/>
					{fields.job.errors && <FieldError>{fields.job.errors}</FieldError>}
				</Field>
				<Field>
					<Label htmlFor={fields.age.id}>Age</Label>
					<SliderConform meta={fields.age} step={1} />
					{fields.age.errors && <FieldError>{fields.age.errors}</FieldError>}
				</Field>
				<Field>
					<div className="flex items-center gap-2">
						<Label htmlFor={fields.isAdult.id}>Is adult</Label>
						<SwitchConform meta={fields.isAdult} />
					</div>
					{fields.isAdult.errors && (
						<FieldError>{fields.isAdult.errors}</FieldError>
					)}
				</Field>
				<Field>
					<Label htmlFor={fields.description.id}>Description</Label>
					<TextareaConform meta={fields.description} />
					{fields.description.errors && (
						<FieldError>{fields.description.errors}</FieldError>
					)}
				</Field>
				<Field>
					<Label htmlFor={fields.accountType.id}>Account type</Label>
					<ToggleGroupConform
						type="single"
						meta={fields.accountType}
						items={[
							{ value: 'personal', label: 'Personal' },
							{ value: 'business', label: 'Business' },
						]}
					/>
					{fields.accountType.errors && (
						<FieldError>{fields.accountType.errors}</FieldError>
					)}
				</Field>
				<Field>
					<fieldset>Interests</fieldset>
					<CheckboxGroupConform
						meta={fields.interests}
						items={[
							{ value: 'react', name: 'React' },
							{ value: 'vue', name: 'Vue' },
							{ value: 'svelte', name: 'Svelte' },
							{ value: 'angular', name: 'Angular' },
							{ value: 'ember', name: 'Ember' },
							{ value: 'next', name: 'Next' },
							{ value: 'nuxt', name: 'Nuxt' },
							{ value: 'sapper', name: 'Sapper' },
							{ value: 'glimmer', name: 'Glimmer' },
						]}
					/>
					{fields.interests.errors && (
						<FieldError>{fields.interests.errors}</FieldError>
					)}
				</Field>
				<Field>
					<Label htmlFor={fields.code.id}>Code</Label>
					<InputOTPConform meta={fields.code} length={6} />
					{fields.code.errors && <FieldError>{fields.code.errors}</FieldError>}
				</Field>

				<div className="flex gap-2">
					<Button type="submit">Submit</Button>
					<Button type="reset" variant="outline">
						Reset
					</Button>
				</div>
			</Form>
		</div>
	);
}
