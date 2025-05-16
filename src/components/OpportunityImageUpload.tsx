import React, { useState } from 'react';
import { uploadOpportunityImage, deleteOpportunityImage } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityImageUploadProps {
  opportunityId: string;
  organizationId: string;
  onImageUploaded: (imageUrl: string, imagePath: string) => void;
  initialImageUrl?: string;
  initialImagePath?: string;
}

export const OpportunityImageUpload: React.FC<OpportunityImageUploadProps> = ({
  opportunityId,
  organizationId,
  onImageUploaded,
  initialImageUrl,
  initialImagePath
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Debug logging
    console.log('OpportunityImageUpload - Starting upload process for file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // If there's an existing image, delete it first
      if (initialImagePath) {
        console.log('OpportunityImageUpload - Deleting existing image:', initialImagePath);
        await deleteOpportunityImage(initialImagePath);
      }

      // Upload the new image
      console.log('OpportunityImageUpload - Uploading new image with params:', {
        opportunityId,
        organizationId
      });
      
      const result = await uploadOpportunityImage(file, opportunityId, organizationId);
      
      if (result) {
        console.log('OpportunityImageUpload - Upload successful:', result);
        setPreviewUrl(result.imageUrl);
        onImageUploaded(result.imageUrl, result.imagePath);
      } else {
        console.error('OpportunityImageUpload - Upload failed: no result returned');
        setError('Failed to upload image');
      }
    } catch (err) {
      console.error('OpportunityImageUpload - Error during upload:', err);
      setError('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Opportunity preview"
            className="max-w-xs rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
}; 