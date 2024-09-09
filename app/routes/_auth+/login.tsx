import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { Field, FieldError } from '~/components/conform/Field';
import { InputConform } from '~/components/conform/Input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { getFormProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { getAuthenticator } from '~/services/auth.server';
import { LoginSchema } from '~/services/auth';

export async function loader({ request, context }: LoaderFunctionArgs) {
	// If the user is already authenticated redirect to /dashboard directly
	return await getAuthenticator(context).isAuthenticated(request, {
		successRedirect: '/',
	});
}
export const action = async ({ request, context }: ActionFunctionArgs) => {
	// we call the method with the name of the strategy we want to use and the
	// request object, optionally we pass an object with the URLs we want the user
	// to be redirected to after a success or a failure
	return await getAuthenticator(context).authenticate('user-pass', request, {
		successRedirect: new URL(request.url).searchParams.get('refirect') ?? '/',
		failureRedirect: '/login',
	});
};

export default function Login() {
	const lastResult = useActionData<typeof action>();
	const navigation = useNavigation();

	const [form, fields] = useForm({
		// Sync the result of last submission
		lastResult: navigation.state === 'idle' ? lastResult : null,
		id: 'signup',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginSchema });
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
	return (
		<div className="flex flex-col gap-6 p-10">
			<h1 className="text-2xl">Login</h1>
			<Form
				method="POST"
				{...getFormProps(form)}
				className="flex flex-col items-stretch gap-4"
			>
				<Field>
					<Label htmlFor={fields.username.id}>Username</Label>
					<InputConform meta={fields.username} type="text" />
					{fields.username.errors && (
						<FieldError>{fields.username.errors}</FieldError>
					)}
				</Field>
				<Field>
					<Label htmlFor={fields.password.id}>Password</Label>
					<InputConform meta={fields.password} type="password" />
					{fields.password.errors && (
						<FieldError>{fields.password.errors}</FieldError>
					)}
				</Field>

				<div className="flex gap-2">
					<Button type="submit">Submit</Button>
				</div>
			</Form>
		</div>
	);
}
