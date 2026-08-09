import type { ParsedResume } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, GraduationCap, Briefcase, Award } from "lucide-react"

interface ParsedResumeCardProps {
  data: ParsedResume
}

export function ParsedResumeCard({ data }: ParsedResumeCardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidate Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <h3 className="text-xl font-bold">{data.name}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {data.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {data.email}
              </span>
            )}
            {data.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {data.phone}
              </span>
            )}
          </div>
          {data.summary && (
            <p className="text-sm">{data.summary}</p>
          )}
        </CardContent>
      </Card>

      {data.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.education.map((edu, i) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="font-medium">{edu.degree}</p>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                {edu.year && <p className="text-xs text-muted-foreground">{edu.year}</p>}
                {edu.details && <p className="text-xs mt-1">{edu.details}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm text-muted-foreground">
                  {exp.company} {exp.duration && `| ${exp.duration}`}
                </p>
                <p className="text-sm mt-1">{exp.description}</p>
                {exp.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-xs flex items-start gap-1.5">
                        <span className="mt-1 h-1 w-1 rounded-full bg-primary shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.projects.map((proj, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{proj.name}</p>
                <p className="text-sm text-muted-foreground">{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.technologies.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.achievements.map((a, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
