/**
 * Populate Sample Responses Script (Simplified)
 * Generates realistic sample responses for a specific form using basic schema
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Target form ID
const FORM_ID = 'df4215ca-d85a-4cb1-b00e-d4d3b5c1325f';

// Sample data generators
const sampleNames = [
  'Emma Johnson', 'Liam Smith', 'Olivia Brown', 'Noah Davis', 'Ava Wilson',
  'Ethan Moore', 'Sophia Taylor', 'Mason Anderson', 'Isabella Thomas', 'William Jackson',
  'Mia White', 'James Harris', 'Charlotte Martin', 'Benjamin Thompson', 'Amelia Garcia',
  'Alexander Rodriguez', 'Harper Lewis', 'Michael Lee', 'Evelyn Walker', 'Daniel Hall'
];

const sampleEmails = [
  'emma.johnson@gmail.com', 'liam.smith@yahoo.com', 'olivia.brown@outlook.com',
  'noah.davis@company.com', 'ava.wilson@student.edu', 'ethan.moore@freelancer.io',
  'sophia.taylor@startup.co', 'mason.anderson@corp.net', 'isabella.thomas@design.agency',
  'william.jackson@tech.dev', 'mia.white@consultant.biz', 'james.harris@marketing.pro',
  'charlotte.martin@health.org', 'benjamin.thompson@finance.com', 'amelia.garcia@creative.studio',
  'alex.rodriguez@remote.work', 'harper.lewis@nonprofit.org', 'michael.lee@ecommerce.store',
  'evelyn.walker@media.house', 'daniel.hall@logistics.solutions'
];

const deviceTypes = ['desktop', 'mobile', 'tablet'];
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
const operatingSystems = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];

// Random value generators
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Generate realistic completion time (in seconds)
const generateCompletionTime = () => randomNumber(120, 1800); // 2 minutes to 30 minutes

// Generate sample answers based on question type
function generateAnswerForQuestion(question) {
  const value = (() => {
    switch (question.type) {
      case 'short_text':
        return `Sample response for "${question.title}"`;
      
      case 'long_text':
        return `This is a longer response to the question "${question.title}". Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
      
      case 'email':
        return randomElement(sampleEmails);
      
      case 'number':
        return randomNumber(1, 100);
      
      case 'phone':
        return `+1${randomNumber(1000000000, 9999999999)}`;
      
      case 'multiple_choice':
        if (question.options && question.options.length > 0) {
          return randomElement(question.options).text || randomElement(question.options);
        }
        return 'Option A';
      
      case 'checkboxes':
        if (question.options && question.options.length > 0) {
          const numSelected = randomNumber(1, Math.min(3, question.options.length));
          const selected = [];
          for (let i = 0; i < numSelected; i++) {
            const option = randomElement(question.options);
            const optionText = option.text || option;
            if (!selected.includes(optionText)) {
              selected.push(optionText);
            }
          }
          return selected;
        }
        return ['Option A', 'Option B'];
      
      case 'dropdown':
        if (question.options && question.options.length > 0) {
          return randomElement(question.options).text || randomElement(question.options);
        }
        return 'Option A';
      
      case 'star_rating':
        return randomNumber(1, 5);
      
      case 'linear_scale':
        const settings = question.settings || {};
        const min = settings.min || 1;
        const max = settings.max || 10;
        return randomNumber(min, max);
      
      case 'nps':
        return randomNumber(0, 10);
      
      case 'emoji_rating':
        return randomNumber(1, 5);
      
      case 'date':
        return randomDate(new Date('2024-01-01'), new Date()).toISOString().split('T')[0];
      
      case 'time':
        const hour = randomNumber(0, 23).toString().padStart(2, '0');
        const minute = randomNumber(0, 59).toString().padStart(2, '0');
        return `${hour}:${minute}:00`;
      
      case 'datetime':
        return randomDate(new Date('2024-01-01'), new Date()).toISOString();
      
      case 'ranking':
        if (question.options && question.options.length > 0) {
          const shuffled = [...question.options].sort(() => Math.random() - 0.5);
          return shuffled.slice(0, Math.min(5, shuffled.length)).map(opt => opt.text || opt);
        }
        return ['Item 1', 'Item 2', 'Item 3'];
      
      case 'matrix':
        if (question.options && question.options.rows && question.options.columns) {
          const result = {};
          question.options.rows.forEach(row => {
            result[row.text || row] = randomElement(question.options.columns).text || randomElement(question.options.columns);
          });
          return result;
        }
        return { 'Row 1': 'Column A', 'Row 2': 'Column B' };
      
      default:
        return 'Sample response';
    }
  })();

  return {
    answerText: typeof value === 'string' ? value : null,
    answerNumber: typeof value === 'number' ? value : null,
    answerBoolean: typeof value === 'boolean' ? value : null,
    answerDate: question.type === 'date' ? value : null,
    answerTime: question.type === 'time' ? value : null,
    answerDatetime: question.type === 'datetime' ? value : null,
    answerJson: (typeof value === 'object' && value !== null) ? value : null,
  };
}

// Main population function
async function populateResponses() {
  try {
    console.log(`🔍 Checking form ${FORM_ID}...`);
    
    // First, verify the form exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', FORM_ID)
      .single();

    if (formError || !form) {
      console.error('❌ Form not found:', formError?.message || 'No form data');
      return;
    }

    console.log(`✅ Found form: "${form.title}"`);

    // Get form questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', FORM_ID)
      .order('order_position');

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError.message);
      return;
    }

    if (!questions || questions.length === 0) {
      console.log('⚠️ No questions found for this form. Creating sample responses without answers.');
    } else {
      console.log(`📝 Found ${questions.length} questions`);
      console.log('Questions:', questions.map(q => `- ${q.title} (${q.type})`).join('\n'));
    }

    // Check existing responses
    const { data: existingResponses } = await supabase
      .from('responses')
      .select('id')
      .eq('form_id', FORM_ID);

    console.log(`📊 Existing responses: ${existingResponses?.length || 0}`);

    // Generate sample responses
    const numResponses = 25;
    console.log(`🚀 Generating ${numResponses} sample responses...`);

    for (let i = 0; i < numResponses; i++) {
      const respondentName = randomElement(sampleNames);
      const respondentEmail = randomElement(sampleEmails);
      const deviceType = randomElement(deviceTypes);
      const browser = randomElement(browsers);
      const os = randomElement(operatingSystems);
      const completionTime = generateCompletionTime();
      const status = randomNumber(1, 10) <= 8 ? 'completed' : 'in_progress'; // 80% completion rate
      const submittedAt = status === 'completed' ? randomDate(new Date('2024-10-01'), new Date()) : null;
      
      // Create response with only available fields
      const responseData = {
        form_id: FORM_ID,
        respondent_name: respondentName,
        respondent_email: respondentEmail,
        status: status,
        completion_percentage: status === 'completed' ? 100 : randomNumber(20, 90),
        time_spent: completionTime,
        started_at: randomDate(new Date('2024-10-01'), new Date()),
        submitted_at: submittedAt,
        device_type: deviceType,
        browser: browser,
        os: os,
        ip_address: `192.168.${randomNumber(1, 255)}.${randomNumber(1, 255)}`,
        location: JSON.stringify({
          city: randomElement(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']),
          country: 'US'
        }),
      };

      const { data: response, error: responseError } = await supabase
        .from('responses')
        .insert(responseData)
        .select()
        .single();

      if (responseError) {
        console.error(`❌ Error creating response ${i + 1}:`, responseError.message);
        continue;
      }

      console.log(`✅ Created response ${i + 1}/${numResponses} (${respondentName})`);

      // Create answers for questions (only if response is completed and questions exist)
      if (status === 'completed' && questions && questions.length > 0) {
        for (const question of questions) {
          const answerData = generateAnswerForQuestion(question);
          
          const answerInsertData = {
            response_id: response.id,
            question_id: question.id,
            answer_text: answerData.answerText,
            answer_number: answerData.answerNumber,
            answer_boolean: answerData.answerBoolean,
            answer_date: answerData.answerDate,
            answer_time: answerData.answerTime,
            answer_datetime: answerData.answerDatetime,
            answer_json: answerData.answerJson,
          };

          // Remove null values
          Object.keys(answerInsertData).forEach(key => {
            if (answerInsertData[key] === null || answerInsertData[key] === undefined) {
              delete answerInsertData[key];
            }
          });

          const { error: answerError } = await supabase
            .from('answers')
            .insert(answerInsertData);

          if (answerError) {
            console.error(`❌ Error creating answer for question ${question.id}:`, answerError.message);
          }
        }
      }
    }

    console.log('🎉 Sample responses generated successfully!');
    console.log('📊 Summary:');
    console.log(`   - Form: ${form.title}`);
    console.log(`   - Questions: ${questions?.length || 0}`);
    console.log(`   - New responses: ${numResponses}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
populateResponses();