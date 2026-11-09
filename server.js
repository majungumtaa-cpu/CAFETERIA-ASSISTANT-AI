
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3005;
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_TOKENS = Number(process.env.MAX_COMPLETION_TOKENS) || 700;
const API_KEY = process.env.GROQ_API_KEY?.trim();

if (!API_KEY) {
    console.error('ERROR: GROQ_API_KEY is missing.');
    process.exit(1);
}

const groq = new Groq({
    apiKey: API_KEY,
    timeout: 60000,
    maxRetries: 2
});

// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// ======================================
// STATIC FILES
// ======================================

app.use(express.static(__dirname, {
    index: false,
    dotfiles: 'ignore'
}));

// ======================================
// CURRENCY RATES
// ======================================

const EXCHANGE_RATES = {
    USD: 1,
    TZS: 2641.89,
    KES: 129.50,
    UGX: 3700,
    EUR: 0.92,
    GBP: 0.79,
    ZAR: 18.50,
    NGN: 1550,
    INR: 83.50,
    CNY: 7.25,
    JPY: 151,
    AED: 3.67,
    SAR: 3.75
};

// ======================================
// HELPER FUNCTIONS
// ======================================

function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatPrice(value) {
    return safeNumber(value).toFixed(2);
}

function cleanText(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).slice(0, 3000);
}

function prepareHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter(item =>
            item &&
            ['user', 'assistant'].includes(item.role) &&
            typeof item.content === 'string'
        )
        .slice(-4)
        .map(item => ({
            role: item.role,
            content: item.content.slice(0, 3000)
        }));
}

// ======================================
// HEALTH CHECK
// ======================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Cafeteria Assistant',
        model: MODEL,
        apiKeyConfigured: Boolean(API_KEY)
    });
});

// ======================================
// CHAT API
// ======================================

app.post('/api/chat', async (req, res) => {

    const {
        message,
        history = [],
        cafeteria_data = {},
        language = 'en'
    } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
            error: 'Please provide a valid message.'
        });
    }

    if (message.length > 10000) {
        return res.status(400).json({
            error: 'Message is too long.'
        });
    }

    // ==================================
    // CAFETERIA DATA
    // ==================================

    const data = cafeteria_data || {};

    const menu = Array.isArray(data.menu) ? data.menu : [];
    const events = Array.isArray(data.events) ? data.events : [];

    const paymentMethods = Array.isArray(data.payment_methods)
        ? data.payment_methods
        : [];

    const team = Array.isArray(data.team) ? data.team : [];
    const stats = data.stats || {};

    // ==================================
    // MENU
    // ==================================

    const menuText = menu.length
        ? menu.map(item => {
            return [
                `Name: ${cleanText(item.name)}`,
                `Category: ${cleanText(item.category)}`,
                `Price: $${formatPrice(item.priceUSD)} USD`,
                `Stock: ${safeNumber(item.quantity)}`
            ].join(' | ');
        }).join('\n')
        : 'Menu is currently empty.';

    // ==================================
    // MENU CATEGORIES
    // ==================================

    const categories = {};

    menu.forEach(item => {
        const category = cleanText(item.category) || 'Other';

        if (!categories[category]) {
            categories[category] = [];
        }

        categories[category].push(
            `${cleanText(item.name)} ($${formatPrice(item.priceUSD)})`
        );
    });

    const categoryText = Object.entries(categories)
        .map(([category, items]) =>
            `${category}: ${items.join(', ')}`
        )
        .join('\n') || 'No categories available.';

    // ==================================
    // EVENTS
    // ==================================

    const eventsText = events.length
        ? events.map(event =>
            `${cleanText(event.name)} | ${cleanText(event.date)} | ${cleanText(event.description)}`
        ).join('\n')
        : 'No upcoming events.';

    // ==================================
    // PAYMENT METHODS
    // ==================================

    const paymentText = paymentMethods.length
        ? paymentMethods.map(cleanText).join(', ')
        : 'Cash';

    // ==================================
    // FOOD KNOWLEDGE
    // ==================================

    let foodKnowledge = '';

    menu.forEach(item => {
        const info = item.food_info || {};

        if (Object.keys(info).length > 0) {
            foodKnowledge += `
FOOD: ${cleanText(item.name)}
Benefits: ${cleanText(info.benefits)}
Nutrition: ${cleanText(info.nutrition)}
Best for: ${cleanText(info.best_for)}
Side effects: ${cleanText(info.side_effects)}
Avoid if: ${cleanText(info.avoid_if)}
`;
        }
    });

    if (!foodKnowledge) {
        foodKnowledge = 'No additional food information available.';
    }

    // ==================================
    // TEAM
    // ==================================

    const adminName =
        team.find(member => member.role === 'Admin')?.name || 'the admin';

    const teamText = team.length
        ? team.map(member =>
            `${cleanText(member.role)}: ${cleanText(member.name)}`
        ).join('\n')
        : 'No team information available.';

    // ==================================
    // STATISTICS
    // ==================================

    const statsText = `
Total customers: ${safeNumber(stats.total_customers)}
Total employees: ${safeNumber(stats.total_employees)}
Total products: ${safeNumber(stats.total_products)}
Total orders: ${safeNumber(stats.total_orders)}
`;

    // ==================================
    // LANGUAGE
    // ==================================

    const langDirective = language === 'sw'
        ? 'Default language is SWAHILI. Answer in the language used by the user.'
        : 'Default language is ENGLISH. Answer in the language used by the user.';

    // ==================================
    // SYSTEM PROMPT
    // ==================================

    const SYSTEM_PROMPT = `
You are Cafeteria Assistant, a friendly and helpful AI assistant.

LANGUAGE:
${langDirective}

IDENTITY:
- Your official name is Cafeteria Assistant.
- You are an AI, never claim to be human.
- If asked who you are, introduce yourself as Cafeteria Assistant.
- Never invent a human identity or personal experiences.

RESPONSE STYLE:
- Answer the exact question.
- Keep answers short and clear.
- Use simple language.
- Use uppercase headings when useful.
- Avoid unnecessary introductions.
- Do not use emojis.
- Do not repeat information unnecessarily.

MENU RULES:
- Only recommend products in the real menu below.
- Never invent menu items or prices.
- Always show prices in USD first.
- Only convert currency when requested.
- Check stock before saying an item is available.
- If the menu is empty, say so honestly.

CURRENCY:
1 USD = ${JSON.stringify(EXCHANGE_RATES)}

MEAL PLANNING:
When asked for a weekly meal plan:
- Create a seven-day plan.
- Include breakfast, lunch and dinner when the menu supports it.
- Use only available menu items.
- Include actual menu prices.
- Calculate the total using the listed prices.
- Do not invent food or prices.
- Avoid unnecessary repetition.
- If the menu is insufficient, explain the limitation.
- Add the weekly cost in USD.
- Convert to TZS only when requested.

HEALTH AND NUTRITION:
- Give general nutrition information, not medical diagnosis.
- Never claim a food cures a disease.
- For diabetes, consider carbohydrate portions and individual dietary needs.
- For high blood pressure, consider sodium content.
- For allergies, warn users to confirm ingredients with staff.
- Never assume an item is safe if its ingredients are unknown.
- Do not make unsupported claims about specific foods.
- Recommend only suitable items actually present in the menu.
- Advise users with medical conditions to consult a qualified healthcare professional.

PRIVACY:
You may share:
- Total customers.
- Total employees.
- Total products.
- Total orders.
- Public staff names and roles.
- Admin name.

Never share:
- Passwords.
- Personal phone numbers.
- Personal email addresses.
- Private customer information.
- Order details belonging to other customers.
- Private addresses.

If asked for private information, say:
"That information is private."

SYSTEM HELP:

LOGIN:
1. Open the homepage.
2. Select Customer Portal or Staff Portal.
3. Enter email and password.
4. Click Login.

FORGOT PASSWORD:
1. Select Forgot Password.
2. Enter your email.
3. Check your email for the OTP.
4. Enter the OTP.
5. Set a new password.

ORDER:
1. Login to Customer Portal.
2. Browse the menu.
3. Add items to cart.
4. Checkout.
5. Select payment method.
6. Confirm the order.

CONTACT:
Admin: ${cleanText(adminName)}
Support: support@cafeteria.com

REAL MENU:
${menuText}

MENU BY CATEGORY:
${categoryText}

EVENTS:
${eventsText}

PAYMENT METHODS:
${paymentText}

STATISTICS:
${statsText}

TEAM:
${teamText}

FOOD KNOWLEDGE:
${foodKnowledge}

IMPORTANT:
Use the information above as the source of truth.
Never fabricate cafeteria information.
`;

    // ==================================
    // AI MESSAGES
    // ==================================

    const messagesPayload = [
        {
            role: 'system',
            content: SYSTEM_PROMPT
        },
        ...prepareHistory(history),
        {
            role: 'user',
            content: message.trim()
        }
    ];

    // ==================================
    // GROQ STREAMING
    // ==================================

    try {

        console.log(
            `[CHAT] Model: ${MODEL} | Language: ${language} | Menu: ${menu.length}`
        );

        const stream = await groq.chat.completions.create({
            messages: messagesPayload,
            model: MODEL,
            temperature: 0.2,
            max_completion_tokens: MAX_TOKENS,
            stream: true
        });

        res.status(200);

        res.setHeader(
            'Content-Type',
            'text/plain; charset=utf-8'
        );

        res.setHeader(
            'Cache-Control',
            'no-cache, no-transform'
        );

        res.setHeader(
            'X-Accel-Buffering',
            'no'
        );

        res.flushHeaders();

        for await (const chunk of stream) {

            if (res.destroyed) {
                break;
            }

            const content =
                chunk.choices?.[0]?.delta?.content || '';

            if (content) {
                res.write(content);
            }
        }

        if (!res.destroyed) {
            res.end();
        }

    } catch (error) {

        console.error(
            '[GROQ ERROR]',
            error.status || '',
            error.message || error
        );

        if (!res.headersSent) {

            const status =
                error.status === 401 ? 502 :
                error.status === 429 ? 429 :
                error.status === 400 ? 400 : 500;

            let errorMessage =
                'Unable to generate a response. Please try again.';

            if (error.status === 401) {
                errorMessage =
                    'Invalid API key. Check your GROQ_API_KEY in Render Environment.';
            }

            if (error.status === 429) {
                errorMessage =
                    'AI request limit reached. Please try again shortly.';
            }

            if (error.status === 400) {
                errorMessage =
                    'Invalid request. Check the model and request parameters.';
            }

            return res.status(status).json({
                error: 'AI service error',
                message: errorMessage
            });
        }

        if (!res.destroyed) {
            res.end('\nUnable to complete the response.');
        }
    }
});

// ======================================
// HOMEPAGE
// ======================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ======================================
// START SERVER
// ======================================

app.listen(PORT, '0.0.0.0', () => {
    console.log('================================');
    console.log('CAFETERIA ASSISTANT IS RUNNING');
    console.log(`PORT: ${PORT}`);
    console.log(`MODEL: ${MODEL}`);
    console.log('STREAMING: ENABLED');
    console.log('GROQ API KEY: CONFIGURED');
    console.log('================================');
});
