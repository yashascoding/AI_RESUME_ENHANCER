import type { ParsedResume } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
            <User className="h-5 w-5 text-indigo-400" />
            Candidate Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <h3 className="text-xl font-bold">{data.name}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            {data.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {data.email}
              </span>
            )}
            {data.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {data.phone}
              </span>
            )}
          </div>
          {data.summary && (
            <p className="text-sm text-zinc-300 leading-relaxed">{data.summary}</p>
          )}
        </CardContent>
      </Card>

      {data.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.education.map((edu, i) => (
              <div key={i} className="border-l-2 border-indigo-500/30 pl-4">
                <p className="font-medium">{edu.degree}</p>
                <p className="text-sm text-zinc-400">{edu.institution}</p>
                {edu.year && <p className="text-xs text-zinc-600 mt-0.5">{edu.year}</p>}
                {edu.details && <p className="text-xs text-zinc-400 mt-1">{edu.details}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-indigo-500/30 pl-4">
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm text-zinc-400">
                  {exp.company} {exp.duration && `· ${exp.duration}`}
                </p>
                <p className="text-sm text-zinc-300 mt-1">{exp.description}</p>
                {exp.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-indigo-400 shrink-0" />
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
              <div key={i} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <p className="font-medium mb-1">{proj.name}</p>
                <p className="text-sm text-zinc-400 mb-2">{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700 text-zinc-300">
                        {t}
                      </span>
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
                <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.achievements.map((a, i) => (
                <li key={i} className="text-sm flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-zinc-300">{a}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
