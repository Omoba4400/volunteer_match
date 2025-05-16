import { supabase } from '@/integrations/supabase/client';

export const uploadOpportunityImage = async (
  file: File,
  opportunityId: string,
  organizationId: string
): Promise<{ imageUrl: string; imagePath: string } | null> => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}/${opportunityId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Attempting to upload file:', {
      fileName,
      filePath,
      organizationId,
      opportunityId,
      fileSize: file.size,
      fileType: file.type
    });

    // Upload the file to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('opportunity_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', {
        error: uploadError,
        name: uploadError.name,
        message: uploadError.message
      });
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('opportunity_images')
      .getPublicUrl(filePath);

    console.log('Successfully uploaded image:', {
      publicUrl,
      filePath,
      data
    });

    return {
      imageUrl: publicUrl,
      imagePath: filePath
    };
  } catch (error) {
    console.error('Error in uploadOpportunityImage:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name
      });
    }
    return null;
  }
};

export const deleteOpportunityImage = async (imagePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('opportunity_images')
      .remove([imagePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteOpportunityImage:', error);
    return false;
  }
}; 