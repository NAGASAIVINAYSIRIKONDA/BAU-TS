
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendInvitationRequest {
  email: string;
  inviterName: string;
  role: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  position?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send invitation function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please set RESEND_API_KEY in Supabase secrets.' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      email, 
      inviterName, 
      role, 
      companyName = "BAU Tracker",
      firstName = "",
      lastName = "",
      department = "",
      position = ""
    }: SendInvitationRequest = await req.json();

    console.log('Processing invitation for:', { email, role, inviterName, companyName });

    let authUserId = null;
    let isNewUser = false;

    // Try to create user account - handle existing users gracefully
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: false, // User needs to confirm via our invitation flow
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          department,
          position,
          invited_by: inviterName,
          role
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('User already exists, proceeding with invitation update...');
          // Get existing user ID
          const { data: existingUser } = await supabase.auth.admin.listUsers();
          const foundUser = existingUser.users?.find(u => u.email === email);
          if (foundUser) {
            authUserId = foundUser.id;
            console.log('Found existing user:', authUserId);
          }
        } else {
          console.error('Unexpected auth error:', authError);
          throw authError;
        }
      } else {
        authUserId = authUser.user?.id;
        isNewUser = true;
        console.log('Created new user:', authUserId);
      }
    } catch (error) {
      console.error('Error in user creation process:', error);
      // Continue with invitation process even if user creation fails
    }

    // Generate invitation token and create/update invitation record
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    console.log('Creating/updating invitation record...');
    const { error: inviteError } = await supabase
      .from('invitations')
      .upsert({
        email,
        role,
        invited_by: inviterName,
        token: invitationToken,
        expires_at: expiresAt.toISOString(),
        is_accepted: false,
        invited_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (inviteError) {
      console.error('Error creating/updating invitation record:', inviteError);
      throw inviteError;
    }

    // Generate invitation acceptance link
    const baseUrl = 'https://dae14616-c7b2-4f1c-8ea9-e02f5edc38f6.lovableproject.com';
    const inviteLink = `${baseUrl}/accept-invitation?token=${invitationToken}&email=${encodeURIComponent(email)}`;

    const roleDisplayName = role === 'Team_Lead' ? 'Team Lead' : role === 'Team_Member' ? 'Team Member' : role;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation - ${companyName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited to Join ${companyName}!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi there!</p>
            
            <p style="margin-bottom: 20px;">
              <strong>${inviterName}</strong> has ${isNewUser ? 'invited' : 'sent you a new invitation to join'} ${companyName} as a <strong>${roleDisplayName}</strong>.
            </p>
            
            <p style="margin-bottom: 30px;">
              Click the button below to ${isNewUser ? 'accept your invitation and set up your account' : 'access your account or update your password'}:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;">
                ${isNewUser ? 'Accept Invitation & Set Up Account' : 'Access Your Account'}
              </a>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Your Role:</strong> ${roleDisplayName}<br>
                <strong>Invited by:</strong> ${inviterName}<br>
                <strong>Company:</strong> ${companyName}
              </p>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              If you're having trouble clicking the button, copy and paste this link into your browser:<br>
              <a href="${inviteLink}" style="color: #667eea; word-break: break-all;">${inviteLink}</a>
            </p>
            
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              This invitation will expire in 7 days. If you weren't expecting this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    console.log('Attempting to send email via Resend...');

    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [email],
      subject: `You're invited to join ${companyName} as ${roleDisplayName}`,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        message: isNewUser ? 'Invitation sent successfully to new user' : 'Invitation resent successfully to existing user',
        userId: authUserId,
        invitationToken,
        isNewUser
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send invitation email',
        details: 'Check function logs for more information'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
