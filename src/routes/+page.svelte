<script lang="ts">
    let tfaRequired = false;
    let tfaError =  false;

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);

		try {
			const request = await fetch('/api/login', {
				method: 'POST',
				body: formData
			});

            const response = await request.json();

            console.log('Response:', response);

            if (response['status'].toLowerCase() === '2fa_required') {
                tfaRequired = true;
            }

		} catch (error) {
			console.error('Error submitting form:', error);
		}
	}

    async function handleTFA(event: Event) {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);

        try {
            const request = await fetch('/api/tfa', {
                method: 'POST',
                body: formData
            });

            const response = await request.json();

            console.log('Response:', response);

            if (response['status'].toLowerCase() === '2fa_error') {
                tfaError = true;
                console.error('2FA failed');
            }

        } catch (error) {
            console.error('Error submitting 2FA:', error);
        }
    }
</script>

<main class="inline-flex flex-col">
    <form on:submit={handleSubmit} class="inline-flex flex-col p-2 gap-2">
        <input type="text" id="username" name="username" placeholder="Username"/>
    
        <input type="password" id="password" name="password" placeholder="Password"/>
    
        <button type="submit" class="border p-1">Login</button>
    </form>
    
    {#if tfaRequired}
        <form on:submit={handleTFA} action="/api/tfa" method="POST" class="inline-flex flex-col p-2 gap-2">
            <input type="text" id="tfa" name="tfa" placeholder="2FA Code" />
            <button type="submit" class="border p-1">Submit 2FA</button>
            {#if tfaError}
                <p class="text-red-500">2FA code is incorrect. Please try again.</p>
            {/if}
        </form>
    {/if}
</main>

