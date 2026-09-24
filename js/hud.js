(() => {
            const form = document.getElementById('litchTrialForm');
            const cardNumber = document.getElementById('trial-number');
            const expiry = document.getElementById('trial-expiry');
            const cvv = document.getElementById('trial-cvv');
            const status = document.getElementById('trialFormStatus');
            const chargeDate = document.getElementById('litchTrialChargeDate');

            // Calcula automaticamente a data exata 25 dias após o início.
            const renewalDate = new Date();
            renewalDate.setDate(renewalDate.getDate() + 25);

            chargeDate.textContent = renewalDate.toLocaleDateString(
                'en-GB',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            );

            // Formatação visual do número do cartão.
            cardNumber.addEventListener('input', () => {
                const digits = cardNumber.value
                    .replace(/\D/g, '')
                    .slice(0, 16);

                cardNumber.value = digits.replace(
                    /(\d{4})(?=\d)/g,
                    '$1 '
                );
            });

            // MM/YY
            expiry.addEventListener('input', () => {
                let digits = expiry.value
                    .replace(/\D/g, '')
                    .slice(0, 4);

                if (digits.length > 2) {
                    digits =
                        digits.slice(0, 2) +
                        '/' +
                        digits.slice(2);
                }

                expiry.value = digits;
            });

            cvv.addEventListener('input', () => {
                cvv.value = cvv.value
                    .replace(/\D/g, '')
                    .slice(0, 4);
            });

            // Demonstração: não envia nem processa dados reais.
            form.addEventListener('submit', (event) => {
                event.preventDefault();

                if (!form.checkValidity()) {
                    form.reportValidity();

                    status.textContent =
                        'Complete all required fields to continue.';

                    status.className =
                        'litch-trial-form__status is-error';

                    return;
                }

                status.textContent =
                    'Demo complete — no real payment was processed.';

                status.className =
                    'litch-trial-form__status is-success';
            });
        })();