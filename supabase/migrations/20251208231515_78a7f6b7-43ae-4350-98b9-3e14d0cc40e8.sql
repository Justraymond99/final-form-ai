-- Add UPDATE policy so users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications" 
ON public.notification_queue FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy so users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notification_queue FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);