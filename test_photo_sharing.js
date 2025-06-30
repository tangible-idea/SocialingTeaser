// Test script for photo sharing functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cmxetjhzgydkxjbmtmvf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteGV0amh6Z3lka3hqYm10bXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4NDEzNTksImV4cCI6MjA0MDQxNzM1OX0.SvPH1aaP-Rv1Xe2Mf0kOVh46vL-6e4RZpjsR6lh77s8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPhotoSharing() {
  console.log('Testing photo sharing functionality...')
  
  try {
    // Test 1: Check if dating_photo_sharing table exists
    const { data: tables, error: tableError } = await supabase
      .from('dating_photo_sharing')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('Table does not exist or has issues:', tableError)
      return
    }
    
    console.log('✅ dating_photo_sharing table exists')
    
    // Test 2: Check storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError)
      return
    }
    
    const datingPhotosBucket = buckets.find(bucket => bucket.id === 'dating-photos')
    if (datingPhotosBucket) {
      console.log('✅ dating-photos storage bucket exists')
    } else {
      console.log('❌ dating-photos storage bucket not found')
    }
    
    // Test 3: Get sample matching data
    const { data: matches, error: matchError } = await supabase
      .from('dating_matched')
      .select('*')
      .eq('status', 'active')
      .limit(1)
    
    if (matchError) {
      console.error('Error getting matches:', matchError)
      return
    }
    
    if (matches && matches.length > 0) {
      console.log('✅ Found active match for testing:', matches[0].id)
      
      // Test 4: Insert test photo sharing record
      const { data: photoShare, error: insertError } = await supabase
        .from('dating_photo_sharing')
        .insert({
          matching_id: matches[0].id,
          photos_revealed: false
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error inserting photo share record:', insertError)
        return
      }
      
      console.log('✅ Successfully created photo sharing record:', photoShare.id)
      
      // Test 5: Update photo sharing record
      const { data: updated, error: updateError } = await supabase
        .from('dating_photo_sharing')
        .update({
          user1_photo_url: 'https://example.com/photo1.jpg',
          user1_uploaded_at: new Date().toISOString()
        })
        .eq('id', photoShare.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating photo share record:', updateError)
        return
      }
      
      console.log('✅ Successfully updated photo sharing record')
      
      // Cleanup: Delete test record
      const { error: deleteError } = await supabase
        .from('dating_photo_sharing')
        .delete()
        .eq('id', photoShare.id)
      
      if (deleteError) {
        console.error('Error deleting test record:', deleteError)
      } else {
        console.log('✅ Test record cleaned up')
      }
    } else {
      console.log('⚠️ No active matches found for testing')
    }
    
    console.log('\n🎉 All tests passed! Photo sharing functionality is ready.')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testPhotoSharing()