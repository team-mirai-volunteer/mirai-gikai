import { formatRoleLabel } from "../constants";

interface IntervieweeInfoProps {
  role?: string | null;
  roleDescription?: string | null;
  roleTitle?: string | null;
  headingLevel?: "h2" | "h3";
}

export function IntervieweeInfo({
  role,
  roleDescription,
  roleTitle,
  headingLevel = "h2",
}: IntervieweeInfoProps) {
  if (!role && !roleDescription && !roleTitle) {
    return null;
  }

  const Heading = headingLevel;
  const roleLabel = formatRoleLabel(role, roleTitle);

  return (
    <div className="flex flex-col gap-4">
      <Heading className="text-xl font-bold text-gray-800">
        👫インタビューを受けた人
      </Heading>
      <div className="bg-white rounded-2xl p-6">
        {roleLabel && (
          <p className="text-base font-bold text-gray-800 mb-2">{roleLabel}</p>
        )}
        <div className="text-sm text-gray-800 whitespace-pre-wrap font-medium">
          {roleDescription
            ?.split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line, index) => (
              <p key={`${index}-${line.slice(0, 20)}`}>
                {line.startsWith("・") ? line : `・${line}`}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
