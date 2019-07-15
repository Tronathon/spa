window.addEventListener('load', () => {
    const el =$('#app');

    const errorTemplate = Handlebars.compile($('#error-template').html());
    const ratesTemplate = Handlebars.compile($('#rates-template').html());
    const exchangeTemplate = Handlebars.compile($('#exchange-template').html());
    const historicalTemplate = Handlebars.compile($('#historical-template').html());

    const router = new Router({
        mode: 'history',
        page404: (path) => {
            const html = errorTemplate({
                color: 'yellow',
                title: 'Error 404 - Page NOT Found!',
                message: `The path '/${path}' does not exist on this site`,
            });
            el.html(html);
        }
    });

    const api = axios.create({
        baseUrl: 'http://localhost:3000',
        timeout: 5000,
    })

    const showError = (error) => {
        const { title, message } = error.response.data;
        const html = errorTemplate({ color: 'red', title, message });
        el.html(html);
    }

    router.add('/', async () => {
        let html = ratesTemplate();
        el.html(html);

        try {
            const response = await api.get('/api/rates');
            const { base, date, rates } = response.data;
            html = ratesTemplate({ base, date, rates });
            el.html(html);
        } catch (error) {
            showError(error);
        } finally {
            $('.loading').removeClass('loading');
        }
    })

    const getConversionResults = async ()  => {
        const from = $('#from').val();
        const to = $('#to').val();
        const amount = $('#amount').val();

        try {
            const response = await api.post('/api/convert', { from, to });
            console.log(response.data)
            const { rate } = response.data;
            console.log(rate)
            const result = rate * amount;
            $('#result').html(`${to} ${result}`);
        } catch (error) {
            showError(error);
        } finally {
            $('#result-segment').removeClass('loading');
        }
    }

    const convertRatesHandler = () => {
        if ($('ui.form').form('is valid')) {
            $('ui.error.message').hide();
            $('#result-segment').addClass('loading');
            getConversionResults();
            return false;
        }
        return true;
    }

    router.add('/exchange', async () => {
        let html = exchangeTemplate();
        el.html(html);
        try {
            const response = await api.get('/api/symbols');
            const { symbols } = response.data;
            html = exchangeTemplate({
                symbols
            });
            el.html(html);
            $('.loading').removeClass('loading');

            $('ui.form').form({
                fields: {
                    from: 'empty',
                    to: 'empty',
                    amount: 'decimal'
                },
            });
            $('.submit').click(convertRatesHandler);
        } catch (error) {
            showError(error);
        }
    })

    router.add('/historical', () => {
        let html = historicalTemplate();
        el.html(html);
    })

    router.navigateTo(window.location.pathname);

    const link = $(`a[href$='${window.location.pathname}']`);
    link.addClass('active');

    $('a').on('click', (event) => {
        event.preventDefault();

        const target = $(event.target);
        $('.item').removeClass('active');
        target.addClass('active');

        const href = target.attr('href');
        const path = href.substr(href.lastIndexOf('/'));
        router.navigateTo(path);
    })

});