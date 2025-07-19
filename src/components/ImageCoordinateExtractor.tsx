
import React, { useState } from 'react';
import EXIF from 'exif-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MapPin, X, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageCoordinateExtractorProps {
  onCoordinatesExtracted: (lat: number, lng: number) => void;
}

const ImageCoordinateExtractor: React.FC<ImageCoordinateExtractorProps> = ({ onCoordinatesExtracted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedCoords, setExtractedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const convertDMSToDD = (degrees: number, minutes: number, seconds: number, direction: string) => {
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    return dd;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer || typeof arrayBuffer === 'string') {
        setIsLoading(false);
        return;
      }

      try {
        const exifData = EXIF.readFromBinaryFile(arrayBuffer);
        
        if (exifData.GPSLatitude && exifData.GPSLongitude) {
          const lat = convertDMSToDD(
            exifData.GPSLatitude[0],
            exifData.GPSLatitude[1],
            exifData.GPSLatitude[2],
            exifData.GPSLatitudeRef
          );
          
          const lng = convertDMSToDD(
            exifData.GPSLongitude[0],
            exifData.GPSLongitude[1],
            exifData.GPSLongitude[2],
            exifData.GPSLongitudeRef
          );

          setExtractedCoords({ lat, lng });
          
          toast({
            title: 'Success!',
            description: `GPS coordinates extracted: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        } else {
          toast({
            title: 'No GPS Data',
            description: 'This image does not contain GPS location data in its EXIF metadata.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error reading EXIF data:', error);
        toast({
          title: 'Error',
          description: 'Failed to read image metadata. Please try another image.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const applyCoordinates = () => {
    if (extractedCoords) {
      onCoordinatesExtracted(extractedCoords.lat, extractedCoords.lng);
      toast({
        title: 'Coordinates Applied',
        description: 'The extracted coordinates have been set for your project.',
      });
    }
  };

  const clearData = () => {
    setExtractedCoords(null);
    setFileName('');
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Extract Location from Image
        </CardTitle>
        <CardDescription>
          Upload a JPEG image with GPS metadata to automatically extract coordinates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg"
            onChange={handleImageUpload}
            disabled={isLoading}
            className="flex-1"
          />
          {extractedCoords && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={clearData}
              title="Clear"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Reading image metadata...</p>
          </div>
        )}

        {extractedCoords && !isLoading && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">Extracted Coordinates:</p>
                <p className="text-lg font-mono">
                  {extractedCoords.lat.toFixed(6)}, {extractedCoords.lng.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">From: {fileName}</p>
              </div>
              <Button
                type="button"
                onClick={applyCoordinates}
                size="sm"
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Apply to Project
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Only JPEG images with embedded GPS data are supported</p>
          <p>• Most modern smartphones save location data in photos (if enabled)</p>
          <p>• Ensure location services were enabled when the photo was taken</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCoordinateExtractor;
