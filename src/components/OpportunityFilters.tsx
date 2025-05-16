import { useState } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

export interface FilterOptions {
  location: string;
  skills: string[];
  causeType: string;
}

interface OpportunityFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const CAUSE_TYPES = [
  'Animal Rescue',
  'Education',
  'Environment',
  'Health',
  'Social Services',
  'Youth Development',
  'Other'
];

const COMMON_SKILLS = [
  'Teaching',
  'Mentoring',
  'Event Planning',
  'Fundraising',
  'Social Media',
  'Graphic Design',
  'Translation',
  'Technical Support',
  'Construction',
  'Medical',
  'Counseling'
];

export function OpportunityFilters({ onFilterChange }: OpportunityFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    skills: [],
    causeType: ''
  });

  const handleLocationChange = (value: string) => {
    const newFilters = { ...filters, location: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSkillChange = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    
    const newFilters = { ...filters, skills: newSkills };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCauseTypeChange = (value: string) => {
    const newFilters = { ...filters, causeType: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = { location: '', skills: [], causeType: '' };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Input
          placeholder="Enter city or zip code"
          value={filters.location}
          onChange={(e) => handleLocationChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cause Type</label>
        <Select value={filters.causeType} onValueChange={handleCauseTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select cause type" />
          </SelectTrigger>
          <SelectContent>
            {CAUSE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Skills</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_SKILLS.map((skill) => (
            <Button
              key={skill}
              variant={filters.skills.includes(skill) ? "default" : "outline"}
              size="sm"
              onClick={() => handleSkillChange(skill)}
            >
              {skill}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );
} 