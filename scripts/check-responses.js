/**
 * Check Populated Responses Script
 * Verifies the responses that were created for the specific form
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Target form ID
const FORM_ID = 'df4215ca-d85a-4cb1-b00e-d4d3b5c1325f';

async function checkResponses() {
  try {
    console.log(`🔍 Checking responses for form ${FORM_ID}...`);
    
    // Get form info
    const { data: form } = await supabase
      .from('forms')
      .select('title, status')
      .eq('id', FORM_ID)
      .single();

    console.log(`📋 Form: ${form?.title || 'Unknown'} (${form?.status || 'unknown'})`);

    // Get responses with basic info
    const { data: responses, error } = await supabase
      .from('responses')
      .select(`
        id,
        respondent_name,
        respondent_email,
        status,
        completion_percentage,
        time_spent,
        submitted_at,
        device_type,
        browser,
        os
      `)
      .eq('form_id', FORM_ID)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching responses:', error.message);
      return;
    }

    console.log(`\n📊 Total Responses: ${responses?.length || 0}\n`);

    if (responses && responses.length > 0) {
      // Status breakdown
      const statusCounts = responses.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});

      console.log('📈 Response Status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} responses`);
      });

      // Device breakdown
      const deviceCounts = responses.reduce((acc, r) => {
        acc[r.device_type] = (acc[r.device_type] || 0) + 1;
        return acc;
      }, {});

      console.log('\n💻 Device Types:');
      Object.entries(deviceCounts).forEach(([device, count]) => {
        console.log(`   - ${device}: ${count} responses`);
      });

      // Completion statistics
      const completedResponses = responses.filter(r => r.status === 'completed');
      const avgTime = completedResponses.reduce((sum, r) => sum + (r.time_spent || 0), 0) / completedResponses.length;

      console.log('\n⏱️ Completion Statistics:');
      console.log(`   - Completed: ${completedResponses.length}/${responses.length} (${((completedResponses.length/responses.length)*100).toFixed(1)}%)`);
      console.log(`   - Average completion time: ${Math.round(avgTime / 60)} minutes`);

      // Sample responses
      console.log('\n👥 Sample Responses:');
      responses.slice(0, 5).forEach((response, index) => {
        console.log(`   ${index + 1}. ${response.respondent_name} (${response.status}) - ${response.device_type}`);
      });

      // Get answers count
      const { data: answersCount } = await supabase
        .from('answers')
        .select('id', { count: 'exact' })
        .in('response_id', responses.map(r => r.id));

      console.log(`\n💬 Total Answers: ${answersCount?.length || 0}`);

      // Get questions for context
      const { data: questions } = await supabase
        .from('questions')
        .select('id, title, type, required')
        .eq('form_id', FORM_ID)
        .order('order_position');

      if (questions && questions.length > 0) {
        console.log('\n📝 Form Questions:');
        questions.forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.title} (${q.type}${q.required ? ', required' : ''})`);
        });
      }
    }

    console.log('\n✅ Response check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkResponses();